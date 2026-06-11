'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BuyerProfile, Priority, UsageFrequency } from '@/types/prediction'

interface Props {
  productUrl: string
  onSubmit: (profile: BuyerProfile) => Promise<void>
  loading: boolean
}

const FREQUENCY_OPTIONS: { value: UsageFrequency; label: string; sub: string }[] = [
  { value: 'daily',      label: '毎日',    sub: '通勤・毎日使用' },
  { value: 'weekly',     label: '週数回',  sub: '定期的に使用' },
  { value: 'occasional', label: '月数回',  sub: 'たまに使用' },
  { value: 'one_time',   label: '一度きり', sub: '旅行・イベント等' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string; emoji: string }[] = [
  { value: 'durability',   label: '耐久性',   emoji: '🛡️' },
  { value: 'portability',  label: '携帯性',   emoji: '🎒' },
  { value: 'performance',  label: '性能',     emoji: '⚡' },
  { value: 'design',       label: 'デザイン', emoji: '✨' },
  { value: 'price',        label: '価格',     emoji: '💰' },
  { value: 'support',      label: 'サポート', emoji: '🤝' },
]

export function BuyerProfileForm({ productUrl, onSubmit, loading }: Props) {
  const [useCase, setUseCase]               = useState('')
  const [frequency, setFrequency]           = useState<UsageFrequency>('daily')
  const [priorities, setPriorities]         = useState<Priority[]>([])
  const [dealbreakers, setDealbreakers]     = useState<string[]>([])
  const [dealInput, setDealInput]           = useState('')

  function togglePriority(p: Priority) {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p].slice(0, 3),
    )
  }

  function addDealbreaker() {
    const trimmed = dealInput.trim()
    if (!trimmed || dealbreakers.length >= 3) return
    setDealbreakers((prev) => [...prev, trimmed])
    setDealInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!useCase.trim()) return
    await onSubmit({
      useCase:      useCase.trim(),
      usageFrequency: frequency,
      priorities,
      dealbreakers,
      budget: 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* 用途 */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          何のために買いますか？
          <span className="ml-1 text-red-500">*</span>
        </label>
        <p className="mb-3 text-xs text-gray-400">
          具体的に書くほど予測精度が上がります
        </p>
        <textarea
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="例: 毎日の電車通勤でスマートフォンを充電するために持ち歩きたい"
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          disabled={loading}
          required
        />
      </div>

      {/* 使用頻度 */}
      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-800">
          使用頻度
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFrequency(opt.value)}
              disabled={loading}
              className={`rounded-xl border p-3 text-left transition-all ${
                frequency === opt.value
                  ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-400">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 重視すること（最大3つ） */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">
          重視すること
          <span className="ml-2 text-xs font-normal text-gray-400">最大3つ</span>
        </label>
        <p className="mb-3 text-xs text-gray-400">
          選んだ項目が満たされないシナリオを重点的に予測します
        </p>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => togglePriority(opt.value)}
              disabled={loading || (priorities.length >= 3 && !priorities.includes(opt.value))}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                priorities.includes(opt.value)
                  ? 'border-indigo-400 bg-indigo-600 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 disabled:opacity-40'
              }`}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 絶対に許せないこと */}
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-800">
          絶対に許せないこと
          <span className="ml-2 text-xs font-normal text-gray-400">任意・最大3つ</span>
        </label>
        <p className="mb-3 text-xs text-gray-400">
          これが起きると後悔するという条件を入力してください
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={dealInput}
            onChange={(e) => setDealInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDealbreaker() } }}
            placeholder="例: 1年以内に壊れる"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            disabled={loading || dealbreakers.length >= 3}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDealbreaker}
            disabled={!dealInput.trim() || dealbreakers.length >= 3}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {dealbreakers.map((d, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs text-red-700"
            >
              {d}
              <button
                type="button"
                onClick={() => setDealbreakers((prev) => prev.filter((_, j) => j !== i))}
                className="hover:text-red-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || !useCase.trim()}
        className="w-full rounded-xl py-3.5 text-base"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            後悔を予測しています...
          </>
        ) : (
          <>
            後悔する確率を予測する
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  )
}
