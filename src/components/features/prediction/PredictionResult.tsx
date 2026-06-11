import type { RegretPrediction } from '@/types/prediction'
import type { ProductSummary } from '@/types/diagnosis'
import { RegretProbabilityGauge } from './RegretProbabilityGauge'
import { RegretTimeline } from './RegretTimeline'
import { RegretScenarios } from './RegretScenarios'
import { BuyerArchetypes } from './BuyerArchetypes'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  prediction: RegretPrediction
  product: ProductSummary
  useCase: string
}

export function PredictionResult({ prediction, product, useCase }: Props) {
  return (
    <div className="space-y-5">

      {/* 商品 + 用途 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-start gap-4">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.title}
              className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 object-contain" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">📦</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">{product.platform} · {product.category}</p>
            <p className="font-semibold text-gray-900 leading-snug">{product.title}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5">
              <span className="text-xs text-indigo-500">🎯 用途:</span>
              <span className="text-xs font-medium text-indigo-700">{useCase}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 後悔確率ゲージ（最も目立つ位置） */}
      <RegretProbabilityGauge
        probability={prediction.overallRegretProbability}
        verdict={prediction.verdict.verdict}
        headline={prediction.verdict.headline}
        oneLineSummary={prediction.verdict.oneLineSummary}
        confidence={prediction.verdict.confidence}
        conditions={prediction.verdict.conditions}
      />

      {/* 時系列 + シナリオ：2カラム */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <RegretTimeline timeline={prediction.timeline} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <RegretScenarios scenarios={prediction.scenarios} />
          </CardContent>
        </Card>
      </div>

      {/* 購入者アーキタイプ */}
      <Card>
        <CardContent className="pt-6">
          <BuyerArchetypes archetypes={prediction.archetypes} />
        </CardContent>
      </Card>

      {/* フッター */}
      <p className="text-center text-xs text-gray-300">
        {prediction.basedOnReviewCount}件のレビューをもとに予測 ·{' '}
        {new Date(prediction.predictionGeneratedAt).toLocaleString('ja-JP')}
      </p>
    </div>
  )
}
