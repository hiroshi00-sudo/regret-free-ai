import { CheckCircle2, XCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { AiAnalysis, RegretTiming, RiskLevel } from '@/types/diagnosis'

const TIMING_LABEL: Record<RegretTiming, string> = {
  immediate:  '購入直後',
  short_term: '1〜3ヶ月後',
  long_term:  '半年以上後',
  unknown:    '時期不明',
}
const TIMING_COLOR: Record<RegretTiming, string> = {
  immediate:  'bg-blue-50 text-blue-600',
  short_term: 'bg-orange-50 text-orange-600',
  long_term:  'bg-red-50 text-red-600',
  unknown:    'bg-gray-50 text-gray-500',
}
const SEVERITY_BADGE: Record<RiskLevel, string> = {
  low:    'bg-green-50 text-green-700 border-green-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high:   'bg-red-50 text-red-700 border-red-100',
}
const SEVERITY_LABEL: Record<RiskLevel, string> = {
  low: '軽微', medium: '中程度', high: '深刻',
}

interface Props {
  analysis: AiAnalysis
}

export function InsightTabs({ analysis }: Props) {
  return (
    <Tabs defaultValue="pros">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="pros">良い点</TabsTrigger>
        <TabsTrigger value="cons">悪い点</TabsTrigger>
        <TabsTrigger value="regret">後悔ポイント</TabsTrigger>
        <TabsTrigger value="persona">向き・不向き</TabsTrigger>
      </TabsList>

      {/* ── 良い点 ── */}
      <TabsContent value="pros" className="mt-6 space-y-5">
        {analysis.pros.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.detail}</p>
              <div className="mt-2 space-y-1">
                {item.evidences.map((e, j) => (
                  <p key={j} className="border-l-2 border-gray-200 pl-3 text-xs text-gray-500">
                    「{e.quote}」
                    <span className="ml-1 text-gray-400">— {e.count}件</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </TabsContent>

      {/* ── 悪い点 ── */}
      <TabsContent value="cons" className="mt-6 space-y-5">
        {analysis.cons.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.detail}</p>
              <div className="mt-2 space-y-1">
                {item.evidences.map((e, j) => (
                  <p key={j} className="border-l-2 border-gray-200 pl-3 text-xs text-gray-500">
                    「{e.quote}」
                    <span className="ml-1 text-gray-400">— {e.count}件</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </TabsContent>

      {/* ── 後悔ポイント（頻度順） ── */}
      <TabsContent value="regret" className="mt-6 space-y-4">
        {analysis.regretPoints.length === 0 ? (
          <p className="text-sm text-gray-400">後悔に関する報告は見当たりませんでした。</p>
        ) : (
          analysis.regretPoints.map((point, i) => (
            <div
              key={i}
              className={cn(
                'rounded-2xl border p-5',
                point.severity === 'high'
                  ? 'border-red-100 bg-red-50/40'
                  : point.severity === 'medium'
                  ? 'border-amber-100 bg-amber-50/40'
                  : 'border-gray-100 bg-gray-50/40',
              )}
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* 順位バッジ */}
                  <span className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                    point.rank === 1 ? 'bg-red-500 text-white'
                    : point.rank === 2 ? 'bg-orange-400 text-white'
                    : point.rank === 3 ? 'bg-amber-400 text-white'
                    : 'bg-gray-200 text-gray-600',
                  )}>
                    {point.rank}
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{point.title}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {/* 頻度 */}
                  <span className="text-xs font-medium text-gray-500 tabular-nums">
                    {point.mentionCount}件 ({point.frequencyRate}%)
                  </span>
                  <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', SEVERITY_BADGE[point.severity])}>
                    {SEVERITY_LABEL[point.severity]}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', TIMING_COLOR[point.timing])}>
                    {TIMING_LABEL[point.timing]}
                  </span>
                </div>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-gray-600">{point.detail}</p>
              <div className="space-y-1.5">
                {point.evidences.map((e, j) => (
                  <p key={j} className="border-l-2 border-gray-300 pl-3 text-xs text-gray-500">
                    「{e.quote}」
                    <span className="ml-1 text-gray-400">— {e.count}件</span>
                  </p>
                ))}
              </div>
            </div>
          ))
        )}
      </TabsContent>

      {/* ── 向き・不向き ── */}
      <TabsContent value="persona" className="mt-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">向いている人</p>
            </div>
            <ul className="space-y-3">
              {analysis.goodFor.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-lg leading-none text-green-500">·</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.label}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{p.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700">向いていない人</p>
            </div>
            <ul className="space-y-3">
              {analysis.badFor.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-lg leading-none text-red-400">·</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.label}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{p.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
