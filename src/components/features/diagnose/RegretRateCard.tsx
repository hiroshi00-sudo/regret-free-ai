'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RegretRate } from '@/types/diagnosis'

interface Props {
  regretRate: RegretRate
}

const LEVEL_CONFIG = {
  low: {
    bg:       'bg-green-50',
    border:   'border-green-100',
    text:     'text-green-700',
    barColor: 'bg-green-500',
    badge:    'bg-green-100 text-green-700',
    label:    '低リスク',
    Icon:     TrendingDown,
    message:  '後悔する可能性は低めです',
  },
  medium: {
    bg:       'bg-amber-50',
    border:   'border-amber-100',
    text:     'text-amber-700',
    barColor: 'bg-amber-500',
    badge:    'bg-amber-100 text-amber-700',
    label:    '中リスク',
    Icon:     Minus,
    message:  '条件次第で後悔する可能性があります',
  },
  high: {
    bg:       'bg-red-50',
    border:   'border-red-100',
    text:     'text-red-700',
    barColor: 'bg-red-500',
    badge:    'bg-red-100 text-red-700',
    label:    '高リスク',
    Icon:     TrendingUp,
    message:  '後悔する可能性が高めです',
  },
} as const

export function RegretRateCard({ regretRate }: Props) {
  const [animatedRate, setAnimatedRate] = useState(0)
  const [animatedWidths, setAnimatedWidths] = useState<number[]>(
    regretRate.factors.map(() => 0),
  )

  const config = LEVEL_CONFIG[regretRate.level]
  const { Icon } = config

  useEffect(() => {
    // 数字カウントアップ
    const duration = 1000
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimatedRate(Math.round(regretRate.rate * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [regretRate.rate])

  useEffect(() => {
    // バーアニメーション
    const t = setTimeout(() => {
      setAnimatedWidths(regretRate.factors.map((f) => f.weight * 100))
    }, 200)
    return () => clearTimeout(t)
  }, [regretRate.factors])

  return (
    <div className={cn('rounded-2xl border p-6', config.bg, config.border)}>
      {/* ヘッダー */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={cn('h-4 w-4', config.text)} />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              後悔率
            </p>
          </div>
          {/* 数字 */}
          <div className="flex items-end gap-1">
            <span className={cn('text-5xl font-semibold tabular-nums', config.text)}>
              {animatedRate}
            </span>
            <span className={cn('mb-1.5 text-xl font-medium', config.text)}>%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{config.message}</p>
        </div>

        {/* レベルバッジ + アイコン */}
        <div className="flex flex-col items-end gap-2">
          <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', config.badge)}>
            {config.label}
          </span>
          <Icon className={cn('h-8 w-8 opacity-20', config.text)} />
        </div>
      </div>

      {/* 全体プログレスバー */}
      <div className="mb-5">
        <div className="h-2 overflow-hidden rounded-full bg-white/60">
          <div
            className={cn('h-full rounded-full transition-all duration-1000 ease-out', config.barColor)}
            style={{ width: `${animatedRate}%` }}
          />
        </div>
      </div>

      {/* 算出根拠 */}
      <div>
        <p className="mb-3 text-xs font-semibold text-gray-400">算出根拠</p>
        <div className="space-y-2.5">
          {regretRate.factors.map((factor, i) => (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">{factor.label}</span>
                  <span className="text-xs text-gray-400">{factor.reviewCount}件</span>
                </div>
                <span className="text-xs text-gray-500 tabular-nums">
                  寄与度 {Math.round(factor.weight * 100)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out',
                    config.barColor,
                    'opacity-70',
                  )}
                  style={{
                    width: `${animatedWidths[i] ?? 0}%`,
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
