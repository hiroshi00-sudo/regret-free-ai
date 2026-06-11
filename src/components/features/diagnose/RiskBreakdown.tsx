'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ScoreBreakdown } from '@/types/diagnosis'

interface RiskBarProps {
  label: string
  score: number
  description: string
}

function RiskBar({ label, score, description }: RiskBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 300)
    return () => clearTimeout(t)
  }, [score])

  const level = score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high'

  const LEVEL_COLOR = {
    low:    'bg-indigo-500',
    medium: 'bg-amber-500',
    high:   'bg-red-500',
  }
  const LEVEL_BADGE = {
    low:    'bg-indigo-50 text-indigo-600 border-indigo-100',
    medium: 'bg-amber-50 text-amber-600 border-amber-100',
    high:   'bg-red-50 text-red-600 border-red-100',
  }
  const LEVEL_LABEL = { low: 'LOW', medium: 'MED', high: 'HIGH' }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{score}</span>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-xs font-semibold',
              LEVEL_BADGE[level],
            )}
          >
            {LEVEL_LABEL[level]}
          </span>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', LEVEL_COLOR[level])}
          style={{ width: `${width}%` }}
        />
      </div>

      <p className="mt-1.5 text-xs text-gray-400">{description}</p>
    </div>
  )
}

interface Props {
  breakdown: ScoreBreakdown
  reviewCount: number
  negativeCount: number
  failureCount: number
  regretCount: number
  returnCount: number
}

export function RiskBreakdown({
  breakdown,
  reviewCount,
  negativeCount,
  failureCount,
  regretCount,
  returnCount,
}: Props) {
  return (
    <div className="space-y-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        リスク内訳
      </p>

      <RiskBar
        label="平均評価"
        score={breakdown.ratingScore}
        description={`レビュー件数: ${reviewCount}件 · 信頼度補正: ×${breakdown.reliabilityFactor}`}
      />
      <RiskBar
        label="ネガティブ率"
        score={breakdown.negativeRateScore}
        description={`ネガティブ判定: ${negativeCount}件 / ${reviewCount}件`}
      />
      <RiskBar
        label="故障・耐久性"
        score={breakdown.failureRateScore}
        description={`故障報告: ${failureCount}件`}
      />
      <RiskBar
        label="後悔・返品言及"
        score={breakdown.regretRateScore}
        description={`後悔: ${regretCount}件 · 返品: ${returnCount}件`}
      />
    </div>
  )
}
