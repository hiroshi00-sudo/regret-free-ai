import { cn } from '@/lib/utils'
import type { RegretScenario, RegretScenarioType, RegretHorizon } from '@/types/prediction'

const SCENARIO_ICON: Record<RegretScenarioType, string> = {
  performance_gap: '📉',
  durability:      '🔧',
  use_case_fit:    '🎯',
  size_weight:     '⚖️',
  price_value:     '💸',
  better_exists:   '🔄',
}

const HORIZON_SHORT: Record<RegretHorizon, string> = {
  week_1:  '1週間',
  month_1: '1ヶ月',
  month_3: '3ヶ月',
  month_6: '6ヶ月',
  year_1:  '1年',
}

interface Props {
  scenarios: RegretScenario[]
}

export function RegretScenarios({ scenarios }: Props) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        後悔シナリオ
      </p>
      <p className="mb-5 text-xs text-gray-400">
        確率の高い順 · 同じ用途の購入者が実際に後悔したパターン
      </p>

      <div className="space-y-4">
        {scenarios.map((scenario, i) => (
          <div
            key={i}
            className={cn(
              'overflow-hidden rounded-2xl border',
              scenario.probability >= 60
                ? 'border-red-100 bg-red-50/50'
                : scenario.probability >= 35
                ? 'border-amber-100 bg-amber-50/50'
                : 'border-gray-100 bg-gray-50/50',
            )}
          >
            <div className="p-5">
              {/* ヘッダー */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{SCENARIO_ICON[scenario.type]}</span>
                  <p className="text-sm font-semibold text-gray-900">{scenario.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn(
                    'text-xl font-bold tabular-nums',
                    scenario.probability >= 60 ? 'text-red-600'
                    : scenario.probability >= 35 ? 'text-amber-600'
                    : 'text-gray-500',
                  )}>
                    {scenario.probability}%
                  </p>
                  <p className="text-xs text-gray-400">で発生</p>
                </div>
              </div>

              {/* ナレーション（未来のストーリー） */}
              <p className="mb-3 text-sm leading-relaxed text-gray-600 border-l-2 border-gray-300 pl-3 italic">
                {scenario.narrative}
              </p>

              {/* メタ情報 */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span>📅 {HORIZON_SHORT[scenario.horizon]}で顕在化</span>
                <span>👥 同用途の {scenario.affectedBuyerRatio}% が後悔</span>
              </div>
            </div>

            {/* 予防策 */}
            <div className="border-t border-dashed border-gray-200 bg-white/60 px-5 py-3">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">回避するには: </span>
                {scenario.preventionTip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
