'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { BuyerProfileForm } from '@/components/features/prediction/BuyerProfileForm'
import { PredictionResult } from '@/components/features/prediction/PredictionResult'
import type { BuyerProfile } from '@/types/prediction'
import type { RegretPrediction } from '@/types/prediction'
import type { ProductSummary } from '@/types/diagnosis'

function PredictPageInner() {
  const searchParams = useSearchParams()
  const initialUrl   = searchParams.get('url') ?? ''

  const [loading, setLoading]         = useState(false)
  const [prediction, setPrediction]   = useState<RegretPrediction | null>(null)
  const [product, setProduct]         = useState<ProductSummary | null>(null)
  const [useCase, setUseCase]         = useState('')
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(profile: BuyerProfile) {
    setLoading(true)
    setError(null)
    setUseCase(profile.useCase)

    try {
      const res = await fetch('/api/v1/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: initialUrl, buyerProfile: profile }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { detail?: string; error?: string }
        throw new Error(errBody.detail ?? errBody.error ?? '予測に失敗しました')
      }

      const data = await res.json() as {
        prediction: RegretPrediction
        product: { url: string; title: string; platform: string }
      }

      setPrediction(data.prediction)
      setProduct({
        id: '',
        url: data.product.url,
        platform: data.product.platform as 'amazon' | 'rakuten' | 'other',
        title: data.product.title,
        reviewCount: data.prediction.basedOnReviewCount,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">

      {!prediction ? (
        <>
          {/* URL表示 */}
          {initialUrl && (
            <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">分析対象</p>
              <p className="truncate text-sm text-gray-700">{initialUrl}</p>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              あなたの購入プロファイルを教えてください
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              用途を詳しく入力するほど、後悔確率の予測精度が上がります。
              <br />
              レビューを読んだ結果ではなく、<strong className="text-gray-700">あなた個人の未来を予測します。</strong>
            </p>
          </div>

          <BuyerProfileForm
            productUrl={initialUrl}
            onSubmit={handleSubmit}
            loading={loading}
          />

          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">後悔予測レポート</h1>
            <button
              onClick={() => { setPrediction(null); setProduct(null) }}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
            >
              ← 再予測する
            </button>
          </div>
          {product && (
            <PredictionResult
              prediction={prediction}
              product={product}
              useCase={useCase}
            />
          )}
        </>
      )}
    </div>
  )
}

export default function PredictPage() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              後悔しないAI
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            トップへ
          </Link>
        </div>
      </header>

      <main>
        <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><p className="text-gray-400">読み込み中...</p></div>}>
          <PredictPageInner />
        </Suspense>
      </main>
    </>
  )
}
