import OpenAI from 'openai'
import {
  reviewAnalysisResponseFormat,
  type ReviewAnalysisOutput,
} from '../schemas/analysisSchema'
import type { AiAnalysis } from '@/types/diagnosis'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface ReviewInput {
  rating: number
  title?: string
  body: string
  reviewedAt?: string
}

export interface AnalyzeReviewsArgs {
  productTitle: string
  productCategory?: string
  useCase?: string
  reviews: ReviewInput[]
}

function buildSystemPrompt(): string {
  return `あなたは「購入判断の専門家」です。
レビューを要約するのではなく、**このユーザーがこの商品を買って後悔しないか**を判断するために分析してください。

## 分析の原則

1. **後悔ポイントの優先度を上げる**
   - 「思ったより小さかった」「半年で壊れた」「用途に合わなかった」など時限式・用途起因の後悔を必ず探す

2. **レビューの信頼性を考慮する**
   - 具体性のある低評価レビューを重視する
   - 「購入直後の感想」と「長期使用後の感想」を区別する

3. **向いていない人を正直に書く**
   - 万人向けに見せるバイアスをかけない

4. **総評は購入判断の材料にする**
   - 「良い商品です」のような曖昧な表現禁止
   - 「〇〇という人には向くが、〇〇な人は後悔するリスクがある」という形式で書く

5. **引用は原文から**
   - evidences の quote はレビューの実際の文章から抜粋する（要約・改変しない）`
}

function buildUserPrompt(args: AnalyzeReviewsArgs): string {
  const { productTitle, productCategory, useCase, reviews } = args
  const reviewsText = reviews
    .map(
      (r, i) =>
        `[レビュー${i + 1}] 評価:${r.rating}★${r.title ? ` タイトル:「${r.title}」` : ''}\n本文:「${r.body}」${r.reviewedAt ? ` 投稿日:${r.reviewedAt}` : ''}`,
    )
    .join('\n\n')

  return `## 分析対象商品
商品名: ${productTitle}
カテゴリ: ${productCategory ?? '不明'}
${useCase ? `購入検討者の用途: ${useCase}` : ''}

## レビュー一覧（${reviews.length}件）

${reviewsText}

---

上記レビューをもとに、この商品を購入すべきかどうかの判断材料を分析してください。
${useCase ? `特に「${useCase}」という用途での適性を重点的に評価してください。` : ''}
レビューに存在しない情報は作らないでください。

## 後悔TOP5の算出ルール（regret_points）
1. レビュー全体から「後悔・失敗・がっかり・返品・壊れた・期待外れ」等のネガティブ言及を探す
2. 同じ不満を訴えているレビューをグルーピングし mention_count を数える
3. mention_count の多い順に最大5件を選ぶ（頻度順 = TOP5）
4. frequency_rate = mention_count / 総レビュー数 × 100（小数点1桁）
5. 件数が少なくても severity=high のものは上位に来やすい（ただし純粋な頻度順を優先）

## 後悔率の算出ルール（regret_rate）
regret_rate.rate は以下の式で算出してください：
1. 各ネガティブ要素について「(review_count / 総レビュー数) × weight × 100」を計算
2. 全要素の合計を後悔率（%）とする。ただし上限は 80%
3. 深刻度 high の regret_points がある場合は +5〜15% 加算
4. factors は件数が多く weight が高いものから降順に並べる`
}

function sampleReviews(reviews: ReviewInput[], maxCount: number): ReviewInput[] {
  if (reviews.length <= maxCount) return reviews

  const byRating = new Map<number, ReviewInput[]>()
  for (const r of reviews) {
    const key = Math.round(r.rating)
    if (!byRating.has(key)) byRating.set(key, [])
    byRating.get(key)!.push(r)
  }

  const perBucket = Math.floor(maxCount / byRating.size)
  const sampled: ReviewInput[] = []
  for (const [, bucket] of byRating) {
    sampled.push(...bucket.slice(0, perBucket))
  }
  return sampled.slice(0, maxCount)
}

function mapToAiAnalysis(raw: ReviewAnalysisOutput): AiAnalysis {
  return {
    pros: raw.pros,
    cons: raw.cons,
    // mention_count 降順でソートし rank を付与
    regretPoints: [...raw.regret_points]
      .sort((a, b) => b.mention_count - a.mention_count)
      .map((r, i) => ({
        title:         r.title,
        detail:        r.detail,
        timing:        r.timing,
        severity:      r.severity,
        evidences:     r.evidences,
        mentionCount:  r.mention_count,
        frequencyRate: Math.round(r.frequency_rate * 10) / 10,
        rank:          i + 1,
      })),
    goodFor: raw.good_for.map((g) => ({ label: g.label, reason: g.reason })),
    badFor: raw.bad_for.map((b) => ({ label: b.label, reason: b.reason })),
    recommendLevel: raw.recommend_level,
    recommendReason: raw.recommend_reason,
    summary: raw.summary,
    confidence: raw.confidence,
    analyzedReviewCount: raw.analyzed_review_count,
    regretRate: {
      rate: Math.round(raw.regret_rate.rate),
      factors: raw.regret_rate.factors.map((f) => ({
        label:       f.label,
        reviewCount: f.review_count,
        weight:      f.weight,
      })),
      level:
        raw.regret_rate.rate < 15 ? 'low'
        : raw.regret_rate.rate < 35 ? 'medium'
        : 'high',
    },
  }
}

export async function analyzeReviews(args: AnalyzeReviewsArgs): Promise<AiAnalysis> {
  const sampled = sampleReviews(args.reviews, 100)

  const response = await openai.beta.chat.completions.parse({
    model: 'gpt-4o-2024-08-06',
    temperature: 0.1,
    max_tokens: 4000,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt({ ...args, reviews: sampled }) },
    ],
    response_format: reviewAnalysisResponseFormat,
  })

  const result = response.choices[0]?.message
  if (!result) throw new Error('No response from OpenAI')
  if (result.refusal) throw new Error(`OpenAI refused: ${result.refusal}`)
  if (!result.parsed) throw new Error('Failed to parse structured output')

  return mapToAiAnalysis({ ...result.parsed, analyzed_review_count: sampled.length })
}
