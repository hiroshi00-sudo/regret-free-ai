'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { RegretTimeline as RegretTimelineType, RegretHorizon } from '@/types/prediction'

const HORIZON_LABEL: Record<RegretHorizon, string> = {
  week_1:  '1週間後',
  month_1: '1ヶ月後',
  month_3: '3ヶ月後',
  month_6: '6ヶ月後',
  year_1:  '1年後',
}

interface Props {
  timeline: RegretTimelineType[]
}

export function RegretTimeline({ timeline }: Props) {
  const [heights, setHeights] = useState<number[]>(timeline.map(() => 0))
  const maxProb = Math.max(...timeline.map((t) => t.probability), 1)

  useEffect(() => {
    const t = setTimeout(() => {
      setHeights(timeline.map((t) => (t.probability / maxProb) * 100))
    }, 200)
    return () => clearTimeout(t)
  }, [timeline, maxProb])

  function barColor(prob: number) {
    if (prob <= 30) return 'bg-green-400'
    if (prob <= 60) return 'bg-amber-400'
    return 'bg-red-400'
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        後悔確率の時系列
      </p>
      <p className="mb-5 text-xs text-gray-400">
        いつ後悔が訪れるかの予測
      </p>

      {/* バーグラフ */}
      <div className="mb-6 flex items-end justify-between gap-2" style={{ height: 80 }}>
        {timeline.map((t, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <span className="text-xs font-semibold tabular-nums text-gray-700">
              {t.probability}%
            </span>
            <div className="w-full overflow-hidden rounded-t-lg bg-gray-100" style={{ height: 56 }}>
              <div
                className={cn(
                  'w-full rounded-t-lg transition-all duration-700 ease-out',
                  barColor(t.probability),
                )}
                style={{
                  height: `${heights[i] ?? 0}%`,
                  transitionDelay: `${i * 80}ms`,
                  // 下から伸びる
                  marginTop: `${100 - (heights[i] ?? 0)}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {HORIZON_LABEL[t.horizon]}
            </span>
          </div>
        ))}
      </div>

      {/* 詳細テキスト */}
      <div className="space-y-3">
        {timeline
          .filter((t) => t.probability >= 20)
          .sort((a, b) => b.probability - a.probability)
          .slice(0, 3)
          .map((t, i) => (
            <div key={i} className="flex gap-3">
              <div className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                barColor(t.probability),
              )}>
                {t.probability}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {HORIZON_LABEL[t.horizon]} — {t.triggerEvent}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{t.evidence}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
