import { createServiceClient } from '@/lib/supabase/server'
import { analyzeReviews } from '@/lib/openai/prompts/analyzeReviews'
import { calcPurchaseScore } from '@/lib/scoring/purchaseScore'
import type { Platform, DiagnosisResult, RegretPoint } from '@/types/diagnosis'
import type { RatingDistribution } from '@/lib/scoring/purchaseScore'

interface PipelineArgs {
  analysisId: string
  productId:  string
  productUrl: string
  platform:   Platform
  useCase?:   string
}

// ── モックレビュー生成（Amazon PA-API 未連携の場合のフォールバック）────
function generateMockReviews(count: number) {
  const templates = [
    { rating: 5, body: '非常に満足しています。品質が高く、使いやすいです。' },
    { rating: 5, body: 'コスパが良く、期待以上の商品でした。' },
    { rating: 4, body: '概ね満足ですが、もう少し改善してほしい点もあります。' },
    { rating: 4, body: '品質は良いですが、サイズが少し大きかったです。' },
    { rating: 3, body: '普通の商品です。特に良くも悪くもありません。' },
    { rating: 2, body: '思っていたよりも品質が低かったです。' },
    { rating: 1, body: '購入後3ヶ月で壊れました。耐久性に問題があります。' },
    { rating: 1, body: '返品したいと思いましたが、手続きが面倒で断念しました。後悔しています。' },
  ]
  return Array.from({ length: count }, (_, i) => ({
    ...templates[i % templates.length]!,
    title: `レビュー${i + 1}`,
  }))
}

// ── 後悔・故障ワードでカウント ─────────────────────────────────
function countKeywords(
  reviews: Array<{ body: string }>,
  keywords: string[],
): number {
  return reviews.filter((r) =>
    keywords.some((k) => r.body.includes(k)),
  ).length
}

export async function runAnalysisPipeline(args: PipelineArgs): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any

  try {
    // ── analyzing に更新 ─────────────────────────────────────
    // @ts-ignore supabase型の複雑な推論を回避
    await supabase
      .from('analyses')
      .update({ status: 'analyzing' })
      .eq('id', args.analysisId)

    // ── レビュー取得（DB から、なければモック）────────────────
    const { data: dbReviews } = await supabase
      .from('reviews')
      .select('rating, title, body, reviewed_at')
      .eq('product_id', args.productId)
      .limit(100)

    const reviews =
      dbReviews && dbReviews.length > 0
        ? dbReviews.map((r: { rating: number | null; title: string | null; body: string; reviewed_at: string | null }) => ({
            rating:     r.rating ?? 3,
            title:      r.title ?? undefined,
            body:       r.body,
            reviewedAt: r.reviewed_at ?? undefined,
          }))
        : generateMockReviews(50)

    // ── 商品情報を取得 ────────────────────────────────────────
    const { data: product } = await supabase
      .from('products')
      .select('title, category, avg_rating')
      .eq('id', args.productId)
      .single()

    // ── AI 分析 ───────────────────────────────────────────────
    const aiAnalysis = await analyzeReviews({
      productTitle:    product?.title ?? '商品',
      productCategory: product?.category ?? undefined,
      useCase:         args.useCase,
      reviews,
    })

    // ── スコア計算 ────────────────────────────────────────────
    const ratingDist = reviews.reduce(
      (acc, r) => {
        const key = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5
        if (key >= 1 && key <= 5) acc[key] = (acc[key] ?? 0) + 1
        return acc
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as RatingDistribution,
    )

    const avgRating =
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

    const negativeCount = countKeywords(reviews, [
      '悪い', 'ひどい', '最悪', '壊れ', '故障', '後悔', '返品', 'がっかり', '失望',
    ])
    const failureCount = countKeywords(reviews, ['壊れ', '故障', '動かない', '使えない'])
    const regretCount  = countKeywords(reviews, ['後悔', '失敗', 'がっかり', '期待外れ'])
    const returnCount  = countKeywords(reviews, ['返品', '返却', '交換'])

    const hasFailureReport = failureCount > 0
    const useCaseMismatch  =
      args.useCase !== undefined &&
      aiAnalysis.badFor.some((b) =>
        args.useCase && b.label.includes(args.useCase.slice(0, 5)),
      )

    const scoreBreakdown = calcPurchaseScore({
      reviewStats: {
        totalCount: reviews.length,
        avgRating,
        ratingDist,
      },
      aiInsights: {
        negativeCount,
        hasFailureReport,
        failureCount,
        regretCount,
        returnCount,
      },
      useCaseMismatch,
    })

    // ── 後悔率フォールバック（AIが返せなかった場合） ─────────────
    if (!aiAnalysis.regretRate) {
      const fallbackRate = Math.round(
        (negativeCount / Math.max(reviews.length, 1)) * 100,
      )
      aiAnalysis.regretRate = {
        rate:    fallbackRate,
        level:   fallbackRate < 15 ? 'low' : fallbackRate < 35 ? 'medium' : 'high',
        factors: aiAnalysis.regretPoints.map((p) => ({
          label:       p.title,
          reviewCount: p.evidences.reduce((s, e) => s + e.count, 0),
          weight:      p.severity === 'high' ? 0.8 : p.severity === 'medium' ? 0.5 : 0.3,
        })),
      }
    }

    // ── 結果を組み立て ────────────────────────────────────────
    const result: DiagnosisResult = {
      aiAnalysis,
      scoreBreakdown,
      alternatives: [],
      analyzedAt: new Date().toISOString(),
    }

    // ── DB に保存 ─────────────────────────────────────────────
    // @ts-ignore supabase型の複雑な推論を回避
    await supabase
      .from('analyses')
      .update({
        status:                  'done',
        result,
        overall_score:           scoreBreakdown.finalScore,
        score_durability:        scoreBreakdown.failureRateScore,
        score_expectation_gap:   scoreBreakdown.negativeRateScore,
        score_price_regret:      scoreBreakdown.regretRateScore,
        score_use_case_mismatch: useCaseMismatch ? 0 : null,
        ai_model:                'gpt-4o-2024-08-06',
        completed_at:            new Date().toISOString(),
        negative_insights:       aiAnalysis.regretPoints.map((r: RegretPoint) => ({
          title:    r.title,
          severity: r.severity,
          timing:   r.timing,
        })),
      })
      .eq('id', args.analysisId)

  } catch (err) {
    console.error('pipeline error', err)
    // @ts-ignore supabase型の複雑な推論を回避
    await supabase
      .from('analyses')
      .update({
        status:        'error',
        error_message: err instanceof Error ? err.message : String(err),
      })
      .eq('id', args.analysisId)
  }
}
