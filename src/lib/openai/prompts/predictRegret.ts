import OpenAI from 'openai'
import {
  regretPredictionResponseFormat,
  type RegretPredictionOutput,
} from '../schemas/predictionSchema'
import type { RegretPrediction, RegretTimeline, RegretScenario, BuyerArchetype } from '@/types/prediction'
import type { ReviewInput } from './analyzeReviews'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── システムプロンプト ─────────────────────────────────────────

function buildSystemPrompt(): string {
  return `あなたは「購入後後悔予測の専門家」です。

## あなたの仕事

レビューを要約することではありません。
「この人がこの商品を買ったら、いつ、どんな理由で後悔するか」を予測することです。

## 予測の考え方

レビューを「過去の購入者の実験データ」として扱います。
- 満足した人は誰か？どんな使い方をしていたか？
- 後悔した人は誰か？何がトリガーになったか？
- 後悔はいつ訪れたか？（開封直後 / 1ヶ月後 / 半年後）
- 後悔した人と入力された用途は一致しているか？

## 予測の精度を上げるルール

1. **時系列で考える**
   - 「重い」→ 購入直後に気づく（week_1）
   - 「耐久性が低い」→ 半年後に気づく（month_6）
   - 「より良い商品が出た」→ 1年後（year_1）

2. **用途を起点にする**
   - 用途が入力されている場合、その視点でシナリオを再評価する
   - 「毎日持ち歩き」用途 × 「重い」= 高確率で後悔

3. **後悔した購入者のプロファイルを抽出する**
   - 後悔レビューを書いた人の用途・期待値・使用期間を読み取る
   - 満足レビューを書いた人のプロファイルも抽出する
   - 入力ユーザーがどちらに近いかをスコアリングする

4. **予測は断言調で書く**
   - NG: 「後悔する可能性があります」
   - OK: 「あなたは3ヶ月以内に重さに不満を感じます」

5. **確率は根拠から算出する**
   - overall_regret_probability = 各シナリオの確率を用途一致度で重み付けして統合
   - レビュー件数が少ない場合は不確実性を加味して中央値寄りにする

## 絶対に書かないこと
- レビューの要約
- 「〜という声があります」という受動的な表現
- 根拠のない楽観的な予測`
}

// ── ユーザープロンプト ────────────────────────────────────────

interface PredictArgs {
  productTitle: string
  productCategory?: string
  buyerProfile: {
    useCase: string
    usageFrequency: string
    priorities: string[]
    dealbreakers: string[]
  }
  reviews: ReviewInput[]
}

function buildUserPrompt(args: PredictArgs): string {
  const { productTitle, productCategory, buyerProfile, reviews } = args

  const reviewsText = reviews
    .map(
      (r, i) =>
        `[R${i + 1}] ★${r.rating} ${r.reviewedAt ? `(${r.reviewedAt})` : ''}\n「${r.body}」`,
    )
    .join('\n\n')

  const priorities = buyerProfile.priorities.join('・')
  const dealbreakers =
    buyerProfile.dealbreakers.length > 0
      ? buyerProfile.dealbreakers.join('・')
      : 'なし'

  return `## この購入を検討している人のプロファイル

用途: ${buyerProfile.useCase}
使用頻度: ${FREQUENCY_LABEL[buyerProfile.usageFrequency] ?? buyerProfile.usageFrequency}
重視すること: ${priorities}
絶対に許せないこと: ${dealbreakers}

---

## 商品情報

商品名: ${productTitle}
カテゴリ: ${productCategory ?? '不明'}

---

## 過去の購入者レビュー（${reviews.length}件）

${reviewsText}

---

## 予測タスク

上記のプロファイルを持つ人が「${productTitle}」を購入した場合の後悔を予測してください。

- overall_regret_probability: 1年以内に後悔する確率を0〜100%で
- timeline: week_1〜year_1 の5時点、各時点での後悔確率と引き金を予測
- scenarios: 最も起きやすい後悔シナリオを確率順に最大4つ
- archetypes: レビューから「後悔した人」「満足した人」のプロファイルを抽出し、この人との一致度を判定
- verdict: 「買うべきか」の最終判定`
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily:      '毎日',
  weekly:     '週数回',
  occasional: '月数回',
  one_time:   '一度きり',
}

// ── マッピング ────────────────────────────────────────────────

function mapToPrediction(
  raw: RegretPredictionOutput,
  reviewCount: number,
): RegretPrediction {
  const timeline: RegretTimeline[] = raw.timeline.map((t) => ({
    horizon:      t.horizon,
    probability:  t.probability,
    triggerEvent: t.trigger_event,
    evidence:     t.evidence,
  }))

  const scenarios: RegretScenario[] = raw.scenarios
    .sort((a, b) => b.probability - a.probability)
    .map((s) => ({
      type:               s.type,
      title:              s.title,
      narrative:          s.narrative,
      probability:        s.probability,
      horizon:            s.horizon,
      affectedBuyerRatio: s.affected_buyer_ratio,
      preventionTip:      s.prevention_tip,
    }))

  const archetypes: BuyerArchetype[] = raw.archetypes
    .sort((a, b) => b.match_score - a.match_score)
    .map((a) => ({
      type:         a.type,
      label:        a.label,
      profile:      a.profile,
      matchScore:   a.match_score,
      sampleQuotes: a.sample_quotes,
    }))

  return {
    overallRegretProbability: Math.round(raw.overall_regret_probability),
    timeline,
    scenarios,
    archetypes,
    verdict: {
      verdict:        raw.verdict.verdict,
      headline:       raw.verdict.headline,
      confidence:     raw.verdict.confidence,
      oneLineSummary: raw.verdict.one_line_summary,
      conditions:     raw.verdict.conditions,
    },
    basedOnReviewCount:    reviewCount,
    predictionGeneratedAt: new Date().toISOString(),
  }
}

// ── エントリポイント ──────────────────────────────────────────

export async function predictRegret(args: PredictArgs): Promise<RegretPrediction> {
  const response = await openai.beta.chat.completions.parse({
    model:       'gpt-4o',
    temperature: 0.15,
    max_tokens:  4000,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user',   content: buildUserPrompt(args) },
    ],
    response_format: regretPredictionResponseFormat,
  })

  const result = response.choices[0]?.message
  if (!result)          throw new Error('No response from OpenAI')
  if (result.refusal)   throw new Error(`OpenAI refused: ${result.refusal}`)
  if (!result.parsed)   throw new Error('Failed to parse structured output')

  return mapToPrediction(result.parsed, args.reviews.length)
}
