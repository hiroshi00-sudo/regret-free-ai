'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Verdict } from '@/types/prediction'

const VERDICT_CONFIG: Record<Verdict, {
  color: string; bg: string; border: string; label: string; emoji: string
}> = {
  buy:              { color: '#16a34a', bg: 'bg-green-50',  border: 'border-green-100', label: '買うべき',           emoji: '✅' },
  buy_with_note:    { color: '#d97706', bg: 'bg-amber-50',  border: 'border-amber-100', label: '条件付きで買うべき', emoji: '⚠️' },
  wait:             { color: '#2563eb', bg: 'bg-blue-50',   border: 'border-blue-100',  label: 'もう少し待つべき',  emoji: '⏳' },
  skip:             { color: '#dc2626', bg: 'bg-red-50',    border: 'border-red-100',   label: 'やめておくべき',    emoji: '🚫' },
  buy_alternative:  { color: '#7c3aed', bg: 'bg-violet-50', border: 'border-violet-100',label: '代替品を探すべき',  emoji: '🔄' },
}

interface Props {
  probability: number
  verdict: Verdict
  headline: string
  oneLineSummary: string
  confidence: number
  conditions: string[]
}

const CIRCUMFERENCE = 2 * Math.PI * 70  // r=70, 半円なので /2

export function RegretProbabilityGauge({
  probability, verdict, headline, oneLineSummary, confidence, conditions,
}: Props) {
  const [animated, setAnimated] = useState(0)
  const [displayed, setDisplayed] = useState(0)
  const animRef = useRef<number | null>(null)
  const config = VERDICT_CONFIG[verdict]

  // 半円ゲージ: 180deg = 50% circumference
  const halfCircumference = CIRCUMFERENCE / 2
  const fillLength = (probability / 100) * halfCircumference

  useEffect(() => {
    const duration = 1400
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimated(fillLength * eased)
      setDisplayed(Math.round(probability * eased))
      if (p < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [probability, fillLength])

  // ゲージカラー: 0-30緑, 31-60黄, 61-100赤
  const gaugeColor =
    probability <= 30 ? '#16a34a'
    : probability <= 60 ? '#d97706'
    : '#dc2626'

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center">

      {/* 半円ゲージ */}
      <div className="relative mx-auto mb-2" style={{ width: 240, height: 130 }}>
        <svg width="240" height="130" viewBox="0 0 240 130">
          {/* トラック（半円） */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#f0f0f5"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* 塗り */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${animated} ${halfCircumference}`}
            style={{ transition: 'stroke-dasharray 0.05s linear' }}
          />
          {/* 中央ラベル */}
          <text x="120" y="90" textAnchor="middle" className="font-sans">
            <tspan
              fontSize="42"
              fontWeight="700"
              fill={gaugeColor}
            >
              {displayed}
            </tspan>
            <tspan fontSize="18" fontWeight="500" fill="#9ca3af">%</tspan>
          </text>
          <text x="120" y="115" textAnchor="middle" fontSize="12" fill="#9ca3af">
            後悔確率
          </text>
        </svg>

        {/* 0 / 100 ラベル */}
        <span className="absolute bottom-0 left-3 text-xs text-gray-300">0</span>
        <span className="absolute bottom-0 right-3 text-xs text-gray-300">100</span>
      </div>

      {/* 判定バッジ */}
      <div className={cn(
        'inline-flex items-center gap-2 rounded-full border px-5 py-2 mb-4',
        config.bg, config.border,
      )}>
        <span className="text-base">{config.emoji}</span>
        <span className="text-sm font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      {/* ヘッドライン */}
      <p className="mb-2 text-lg font-semibold leading-snug text-gray-900">
        {headline}
      </p>

      {/* 一言サマリー */}
      <p className="mx-auto mb-5 max-w-xs text-sm leading-relaxed text-gray-500">
        {oneLineSummary}
      </p>

      {/* 信頼度 */}
      <div className="mb-4 flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>予測の信頼度</span>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-400 transition-all duration-1000"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="font-medium text-gray-600">{confidence}%</span>
      </div>

      {/* 成立条件 */}
      {conditions.length > 0 && (
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="mb-1.5 text-xs font-medium text-gray-400">この予測が成立する条件</p>
          <ul className="space-y-1">
            {conditions.map((c, i) => (
              <li key={i} className="text-xs text-gray-600">· {c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
