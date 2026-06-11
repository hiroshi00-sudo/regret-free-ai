import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const EvidenceSchema = z.object({
  quote: z.string().describe('レビューからの引用（原文ママ、50文字以内）'),
  count: z.number().int().min(1).describe('同趣旨の報告件数'),
})

const InsightItemSchema = z.object({
  title:     z.string().describe('見出し（20文字以内）'),
  detail:    z.string().describe('具体的な説明（80文字以内）'),
  evidences: z.array(EvidenceSchema).min(1).max(3),
})

const RegretPointSchema = z.object({
  title:          z.string().describe('後悔の見出し（20文字以内）'),
  detail:         z.string().describe('後悔の具体的な状況説明（80文字以内）'),
  timing:         z.enum(['immediate', 'short_term', 'long_term', 'unknown'])
                   .describe('immediate=購入直後, short_term=1〜3ヶ月, long_term=半年以上'),
  severity:       z.enum(['low', 'medium', 'high']).describe('後悔の深刻度'),
  evidences:      z.array(EvidenceSchema).min(1).max(3),
  mention_count:  z.number().int().min(1)
                   .describe('このポイントに言及・同意しているレビューの実件数。evidencesのcountの合計ではなく独立に数える'),
  frequency_rate: z.number().min(0).max(100)
                   .describe('全レビュー件数に対する mention_count の割合(%)。小数点1桁まで'),
})

const PersonaSchema = z.object({
  label:  z.string().describe('ペルソナの一言表現（例: 毎日持ち歩く人）'),
  reason: z.string().describe('判断の根拠（60文字以内）'),
})

// 後悔率の根拠となるネガティブ要素
const RegretFactorSchema = z.object({
  label:        z.string().describe('ネガティブ要素の短い見出し（例: 重い、バッテリーが短い、初期不良）'),
  review_count: z.number().int().min(0).describe('このネガティブ要素に言及しているレビューの件数'),
  weight:       z.number().min(0).max(1).describe('この要素が後悔率に与える寄与度 0.0〜1.0。深刻・頻出なほど高くする'),
})

export const ReviewAnalysisSchema = z.object({
  pros: z.array(InsightItemSchema).min(1).max(5)
    .describe('繰り返し言及される良い点'),
  cons: z.array(InsightItemSchema).min(1).max(5)
    .describe('改善を望む声が複数ある悪い点'),
  regret_points: z.array(RegretPointSchema).min(0).max(5)
    .describe('購入後に後悔・失敗したという声。mention_count の多い順（頻度順）に並べる。最大5件'),
  good_for: z.array(PersonaSchema).min(1).max(4)
    .describe('この商品が特に向いているユーザー像'),
  bad_for: z.array(PersonaSchema).min(1).max(4)
    .describe('この商品が向いていないユーザー像'),
  recommend_level: z.enum([
    'strongly_recommend',
    'recommend',
    'conditional',
    'not_recommend',
    'strongly_not_recommend',
  ]).describe('総合的な購入推奨度'),
  recommend_reason: z.string().describe('推奨度の判断根拠（100文字以内）'),
  summary: z.string().describe('購入判断のための総評（150文字以内）'),
  confidence: z.number().min(0).max(1).describe('分析の確信度 0.0〜1.0'),
  analyzed_review_count: z.number().int().describe('分析に使ったレビュー件数'),
  // 後悔率: ネガティブ要素から推定した「購入後に後悔する確率」
  regret_rate: z.object({
    rate: z.number().min(0).max(100)
      .describe('購入後に後悔する推定確率 0〜100(%)。各ネガティブ要素の件数と重みを総合して算出する'),
    factors: z.array(RegretFactorSchema).min(1).max(8)
      .describe('後悔率の算出根拠となるネガティブ要素リスト。件数が多く重大なものから順に並べる'),
  }).describe('後悔率とその根拠'),
})

export type ReviewAnalysisOutput = z.infer<typeof ReviewAnalysisSchema>

export const reviewAnalysisResponseFormat = zodResponseFormat(
  ReviewAnalysisSchema,
  'review_analysis',
)
