'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RegretPoint, RiskLevel, RegretTiming } from '@/types/diagnosis'

// ── 定数 ─────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<RiskLevel, { bar: string; badge: string; label: string }> = {
  high:   { bar: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',    label: '深刻' },
  medium: { bar: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200', label: '中程度' },
  low:    { bar: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: '軽微' },
}

const TIMING_CONFIG: Record<RegretTiming, { label: string; color: string }> = {
  immediate:  { label: '購入直後',   color: 'text-blue-500' },
  short_term: { label: '1〜3ヶ月後', color: 'text-orange-500' },
  long_term:  { label: '半年以上後', color: 'text-red-500' },
  unknown:    { label: '時期不明',   color: 'text-gray-400' },
}

// ── 個別行 ────────────────────────────────────────────────────

interface RowProps {
  point: RegretPoint
  maxMentionCount: number
  animate: boolean
}

function RegretRow({ point, maxMentionCount, animate }: RowProps) {
  const [barWidth, setBarWidth] = useState(0)
  const [countUp, setCountUp]   = useState(0)
  const animRef = useRef<number | null>(null)

  const barTarget = (point.mentionCount / maxMentionCount) * 100
  const severity  = SEVERITY_CONFIG[point.severity]
  const timing    = TIMING_CONFIG[point.timing]

  useEffect(() => {
    if (!animate) return

    // バー & カウントアップ
    const delay = (point.rank - 1) * 100
    const timer = setTimeout(() => {
      setBarWidth(barTarget)

      const duration = 700
      const start    = performance.now()
      function tick(now: number) {
        const p = Math.min((now - start) / duration, 1)
        setCountUp(Math.round(point.mentionCount * (1 - Math.pow(1 - p, 2))))
        if (p < 1) animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [animate, barTarget, point.mentionCount, point.rank])

  return (
    <div className="group relative">
      {/* 順位ライン */}
      <div className="flex items-start gap-4">

        {/* 順位バッジ */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
            point.rank === 1
              ? 'bg-red-500 text-white shadow-md shadow-red-200'
              : point.rank === 2
              ? 'bg-orange-400 text-white shadow-sm shadow-orange-200'
              : point.rank === 3
              ? 'bg-amber-400 text-white shadow-sm shadow-amber-200'
              : 'bg-gray-100 text-gray-500',
          )}
        >
          {point.rank}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          {/* タイトル行 */}
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{point.title}</span>
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', severity.badge)}>
              {severity.label}
            </span>
            <span className={cn('flex items-center gap-1 text-xs', timing.color)}>
              <Clock className="h-3 w-3" />
              {timing.label}
            </span>
          </div>

          {/* 詳細テキスト */}
          <p className="mb-2.5 text-xs leading-relaxed text-gray-500">{point.detail}</p>

          {/* 頻度バー */}
          <div className="mb-1.5 flex items-center gap-3">
            <div className="flex-1 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn('h-full rounded-full transition-all duration-700 ease-out', severity.bar)}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <div className="shrink-0 tabular-nums text-right">
              <span className="text-sm font-semibold text-gray-900">{countUp}</span>
              <span className="ml-1 text-xs text-gray-400">件</span>
              <span className="ml-1.5 text-xs font-medium text-gray-500">
                ({point.frequencyRate}%)
              </span>
            </div>
          </div>

          {/* 代表引用 */}
          {point.evidences[0] && (
            <p className="border-l-2 border-gray-200 pl-3 text-xs text-gray-400 leading-relaxed">
              「{point.evidences[0].quote}」
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── メイン ────────────────────────────────────────────────────

interface Props {
  regretPoints: RegretPoint[]
  totalReviewCount: number
}

export function RegretTop5({ regretPoints, totalReviewCount }: Props) {
  const [animate, setAnimate] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Intersection Observer でビューポートに入ったらアニメーション開始
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setAnimate(true) },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (regretPoints.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <SectionHeader />
        <p className="mt-6 text-sm text-gray-400">
          顕著な後悔ポイントは見当たりませんでした。
        </p>
      </div>
    )
  }

  const maxCount = regretPoints[0]?.mentionCount ?? 1
  // 全体の後悔言及をのべ件数で集計
  const totalMentions = regretPoints.reduce((s, p) => s + p.mentionCount, 0)

  return (
    <div ref={ref} className="rounded-2xl border border-gray-100 bg-white p-6">
      <SectionHeader />

      {/* サマリー */}
      <div className="mt-4 mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">後悔言及（のべ）</p>
            <p className="text-lg font-semibold text-gray-900 tabular-nums">
              {totalMentions.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-gray-400">件</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">分析レビュー総数</p>
            <p className="text-lg font-semibold text-gray-900 tabular-nums">
              {totalReviewCount.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-gray-400">件</span>
            </p>
          </div>
        </div>
      </div>

      {/* TOP5リスト */}
      <div className="space-y-6">
        {regretPoints.map((point, i) => (
          <div key={i}>
            {i > 0 && <div className="mb-6 h-px bg-gray-100" />}
            <RegretRow
              point={point}
              maxMentionCount={maxCount}
              animate={animate}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          購入者が最も後悔しているポイント
        </p>
        <p className="text-[11px] text-gray-400">頻度順 TOP5</p>
      </div>
    </div>
  )
}
