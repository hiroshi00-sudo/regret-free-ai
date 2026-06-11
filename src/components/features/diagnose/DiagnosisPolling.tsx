'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import type { DiagnoseResultResponse } from '@/types/api'
import { ScoreCircle } from './ScoreCircle'
import { RiskBreakdown } from './RiskBreakdown'
import { InsightTabs } from './InsightTabs'
import { AlternativeSuggests } from './AlternativeSuggests'
import { RegretRateCard } from './RegretRateCard'
import { RegretTop5 } from './RegretTop5'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STATUS_MESSAGES: Record<string, string> = {
  pending:   'レビューを取得しています...',
  analyzing: 'AIが100件のレビューを分析中...',
}

interface Props {
  diagnosisId: string
}

export function DiagnosisPolling({ diagnosisId }: Props) {
  const [data, setData]     = useState<DiagnoseResultResponse | null>(null)
  const [error, setError]   = useState<string | null>(null)

  const fetchResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/diagnose/${diagnosisId}`)
      if (!res.ok) throw new Error('取得に失敗しました')
      const json = (await res.json()) as DiagnoseResultResponse
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    }
  }, [diagnosisId])

  useEffect(() => {
    void fetchResult()
  }, [fetchResult])

  // pending / analyzing の間はポーリング
  useEffect(() => {
    if (!data) return
    if (data.status === 'done' || data.status === 'error') return

    const interval = setInterval(() => { void fetchResult() }, 3000)
    return () => clearInterval(interval)
  }, [data, fetchResult])

  // ── ローディング ─────────────────────────────────────────────
  if (!data || data.status === 'pending' || data.status === 'analyzing') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900">
            {STATUS_MESSAGES[data?.status ?? 'pending']}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            通常30秒〜1分かかります
          </p>
        </div>
      </div>
    )
  }

  // ── エラー ────────────────────────────────────────────────────
  if (data.status === 'error') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="font-medium text-red-600">分析中にエラーが発生しました</p>
        <p className="text-sm text-gray-500">{data.error ?? '不明なエラー'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const { product, result } = data
  if (!result) return null

  const { aiAnalysis, scoreBreakdown, alternatives } = result

  return (
    <div className="space-y-5 animate-fade-up">

      {/* 商品情報 */}
      <div className="flex items-start gap-5">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-20 w-20 shrink-0 rounded-2xl bg-gray-100 object-contain"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
            📦
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="mb-1.5 flex flex-wrap gap-2">
            <Badge variant="default">{product.platform}</Badge>
            {product.category && <Badge variant="default">{product.category}</Badge>}
          </div>
          <h1 className="text-xl font-semibold leading-snug text-gray-900">
            {product.title}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {product.price ? `¥${product.price.toLocaleString()} · ` : ''}
            レビュー {product.reviewCount.toLocaleString()}件 · 分析完了{' '}
            {new Date(result.analyzedAt).toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>

      {/* スコア + リスク */}
      <div className="grid gap-5 sm:grid-cols-5">
        <Card className="sm:col-span-2 flex items-center justify-center p-8">
          <ScoreCircle
            score={scoreBreakdown.finalScore}
            grade={scoreBreakdown.grade}
            label={scoreBreakdown.label}
            confidence={scoreBreakdown.confidence}
            reviewCount={aiAnalysis.analyzedReviewCount}
          />
        </Card>

        <Card className="sm:col-span-3">
          <CardContent className="pt-6">
            <RiskBreakdown
              breakdown={scoreBreakdown}
              reviewCount={aiAnalysis.analyzedReviewCount}
              negativeCount={0}
              failureCount={0}
              regretCount={0}
              returnCount={0}
            />
          </CardContent>
        </Card>
      </div>

      {/* 後悔率 */}
      <RegretRateCard regretRate={aiAnalysis.regretRate} />

      {/* 総評 */}
      <Card>
        <CardContent className="pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            総評
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{aiAnalysis.summary}</p>
          <p className="mt-3 text-xs text-gray-400">{aiAnalysis.recommendReason}</p>
        </CardContent>
      </Card>

      {/* 後悔TOP5 */}
      <RegretTop5
        regretPoints={aiAnalysis.regretPoints}
        totalReviewCount={aiAnalysis.analyzedReviewCount}
      />

      {/* タブ: 良い点・悪い点・後悔・向き不向き */}
      <Card>
        <CardContent className="pt-6">
          <InsightTabs analysis={aiAnalysis} />
        </CardContent>
      </Card>

      {/* 代替品 */}
      {alternatives.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <AlternativeSuggests alternatives={alternatives} />
          </CardContent>
        </Card>
      )}

    </div>
  )
}
