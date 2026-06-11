'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ScoreGrade } from '@/types/diagnosis'

const GRADE_COLOR: Record<ScoreGrade, string> = {
  S: '#16a34a',
  A: '#2563eb',
  B: '#d97706',
  C: '#ea580c',
  D: '#dc2626',
  F: '#9333ea',
}

interface Props {
  score: number
  grade: ScoreGrade
  label: string
  confidence: 'low' | 'medium' | 'high'
  reviewCount: number
}

const CIRCUMFERENCE = 2 * Math.PI * 60  // r=60

export function ScoreCircle({ score, grade, label, confidence, reviewCount }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const [offset, setOffset]       = useState(CIRCUMFERENCE)
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    // カウントアップ
    const duration = 1200
    const start    = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(score * eased))
      setOffset(CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE * eased)
      if (p < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [score])

  const gradeColor = GRADE_COLOR[grade]

  const CONFIDENCE_LABEL = { low: '低', medium: '中', high: '高' } as const

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 円グラフ */}
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* トラック */}
          <circle cx="80" cy="80" r="60" fill="none" stroke="#f0f0f5" strokeWidth="12" />
          {/* 塗り */}
          <circle
            cx="80"
            cy="80"
            r="60"
            fill="none"
            stroke={gradeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>

        {/* ラベル */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tracking-tight text-gray-900">
            {displayed}
          </span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>

      {/* グレードバッジ */}
      <div className="text-center">
        <span
          className={cn(
            'inline-block rounded-full border px-4 py-1.5 text-sm font-medium',
          )}
          style={{
            backgroundColor: gradeColor + '15',
            color: gradeColor,
            borderColor: gradeColor + '40',
          }}
        >
          {label}
        </span>
        <p className="mt-2 text-xs text-gray-400">
          信頼度:{' '}
          <span className="font-medium text-gray-700">
            {CONFIDENCE_LABEL[confidence]}
          </span>{' '}
          · {reviewCount.toLocaleString()}件分析
        </p>
      </div>
    </div>
  )
}
