import { cn } from '@/lib/utils'
import type { BuyerArchetype } from '@/types/prediction'

interface Props {
  archetypes: BuyerArchetype[]
}

export function BuyerArchetypes({ archetypes }: Props) {
  const regretTypes    = archetypes.filter((a) => a.type === 'regret')
  const satisfiedTypes = archetypes.filter((a) => a.type === 'satisfied')

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        あなたは誰に近いか
      </p>
      <p className="mb-5 text-xs text-gray-400">
        過去の購入者を「後悔した人」「満足した人」に分類し、あなたとの一致度を判定
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* 後悔したタイプ */}
        {regretTypes.map((a, i) => (
          <ArchetypeCard key={i} archetype={a} />
        ))}
        {/* 満足したタイプ */}
        {satisfiedTypes.map((a, i) => (
          <ArchetypeCard key={i} archetype={a} />
        ))}
      </div>
    </div>
  )
}

function ArchetypeCard({ archetype }: { archetype: BuyerArchetype }) {
  const isRegret = archetype.type === 'regret'
  const matchHigh = archetype.matchScore >= 60

  return (
    <div className={cn(
      'rounded-2xl border p-5 transition-all',
      isRegret
        ? matchHigh ? 'border-red-200 bg-red-50/60' : 'border-gray-100 bg-white'
        : matchHigh ? 'border-green-200 bg-green-50/60' : 'border-gray-100 bg-white',
    )}>
      {/* ヘッダー */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isRegret ? '😞' : '😊'}</span>
          <p className="text-xs font-semibold text-gray-700">{archetype.label}</p>
        </div>
        {/* 一致度リング */}
        <div className="shrink-0 text-right">
          <p className={cn(
            'text-xl font-bold tabular-nums',
            isRegret
              ? matchHigh ? 'text-red-600' : 'text-gray-400'
              : matchHigh ? 'text-green-600' : 'text-gray-400',
          )}>
            {archetype.matchScore}%
          </p>
          <p className="text-xs text-gray-400">一致</p>
        </div>
      </div>

      {/* プロファイル */}
      <p className="mb-3 text-xs leading-relaxed text-gray-600">{archetype.profile}</p>

      {/* 一致度バー */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            isRegret ? 'bg-red-400' : 'bg-green-400',
          )}
          style={{ width: `${archetype.matchScore}%` }}
        />
      </div>

      {/* 代表引用 */}
      <div className="space-y-1">
        {archetype.sampleQuotes.map((q, i) => (
          <p key={i} className="border-l-2 border-gray-200 pl-2.5 text-xs text-gray-400">
            「{q}」
          </p>
        ))}
      </div>

      {/* 警告 / 安心バッジ */}
      {matchHigh && (
        <div className={cn(
          'mt-3 rounded-lg px-3 py-2 text-xs font-medium',
          isRegret
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700',
        )}>
          {isRegret
            ? '⚠️ あなたはこのパターンに近い可能性があります'
            : '✅ あなたはこのパターンに近く、満足できる可能性が高いです'}
        </div>
      )}
    </div>
  )
}
