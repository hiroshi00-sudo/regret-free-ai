import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const RegretTimelineSchema = z.object({
  horizon: z.enum(['week_1', 'month_1', 'month_3', 'month_6', 'year_1']),
  probability: z.number().min(0).max(100)
    .describe('この時点までに後悔している確率(%)。直近ほど低く、長期ほど高くなる傾向'),
  trigger_event: z.string()
    .describe('後悔を引き起こす具体的な出来事の予測。例: 「毎日持ち歩いて腰が痛くなる」'),
  evidence: z.string()
    .describe('この予測の根拠となるレビューのパターン。例: 「重さへの言及が34件、うち8割が1ヶ月以内」'),
})

const RegretScenarioSchema = z.object({
  type: z.enum([
    'performance_gap',
    'durability',
    'use_case_fit',
    'size_weight',
    'price_value',
    'better_exists',
  ]),
  title: z.string().describe('シナリオの見出し（25文字以内）'),
  narrative: z.string()
    .describe('このシナリオが発生した場合の具体的なストーリー。購入者の視点で、時系列で語る（100文字以内）'),
  probability: z.number().min(0).max(100)
    .describe('このシナリオが発生する確率(%)'),
  horizon: z.enum(['week_1', 'month_1', 'month_3', 'month_6', 'year_1'])
    .describe('このシナリオがいつ顕在化するか'),
  affected_buyer_ratio: z.number().min(0).max(100)
    .describe('同じ用途・目的の購入者のうち、このシナリオで後悔した割合(%)'),
  prevention_tip: z.string()
    .describe('このシナリオを回避するための具体的なアドバイス（60文字以内）'),
})

const BuyerArchetypeSchema = z.object({
  type: z.enum(['regret', 'satisfied']),
  label: z.string().describe('アーキタイプの一言表現（例: 毎日持ち歩いて後悔した人）'),
  profile: z.string()
    .describe('このアーキタイプの購入者の特徴・行動パターン（80文字以内）'),
  match_score: z.number().min(0).max(100)
    .describe('入力された用途・優先度とこのアーキタイプの一致度(%)'),
  sample_quotes: z.array(z.string()).min(1).max(2)
    .describe('このアーキタイプを代表するレビュー引用（原文ママ）'),
})

const PredictionVerdictSchema = z.object({
  verdict: z.enum(['buy', 'buy_with_note', 'wait', 'skip', 'buy_alternative']),
  headline: z.string()
    .describe('予測結果の見出し。「あなたは〜する可能性が高い」形式（40文字以内）'),
  confidence: z.number().min(0).max(100)
    .describe('この予測の信頼度(%)。レビュー件数・用途の一致度から算出'),
  one_line_summary: z.string()
    .describe('購入判断を一言で。断言調で書く（60文字以内）'),
  conditions: z.array(z.string()).min(0).max(3)
    .describe('この予測が成立する条件。例: 「毎日持ち歩く場合」「保証なしで購入する場合」'),
})

export const RegretPredictionSchema = z.object({
  overall_regret_probability: z.number().min(0).max(100)
    .describe('購入後1年以内に後悔する総合確率(%)。全シナリオを統合した値'),

  timeline: z.array(RegretTimelineSchema)
    .min(1).max(5)
    .describe('week_1〜year_1 の5時点。確率は単調増加にならなくてよい'),

  scenarios: z.array(RegretScenarioSchema).min(1).max(4)
    .describe('最も発生確率の高いシナリオ順。用途が入力された場合は use_case_fit を優先的に評価'),

  archetypes: z.array(BuyerArchetypeSchema).min(2).max(4)
    .describe('regret と satisfied を最低1つずつ含む。match_score の高い順に並べる'),

  verdict: PredictionVerdictSchema,

  based_on_review_count: z.number().int()
    .describe('予測に使用したレビュー件数'),
})

export type RegretPredictionOutput = z.infer<typeof RegretPredictionSchema>

export const regretPredictionResponseFormat = zodResponseFormat(
  RegretPredictionSchema,
  'regret_prediction',
)
