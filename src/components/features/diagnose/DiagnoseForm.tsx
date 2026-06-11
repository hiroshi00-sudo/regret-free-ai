'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DiagnoseForm() {
  const router   = useRouter()
  const [url, setUrl]         = useState('')
  const [useCase, setUseCase] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    // URL入力後は後悔予測フローへ（プロファイル入力画面）
    router.push(`/predict?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-3">
      {/* メインURL入力 */}
      <div className="glass rounded-2xl p-2 shadow-xl shadow-gray-200/60">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Amazon / 楽天の商品URLを貼り付ける"
            className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            disabled={loading}
            required
          />
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="shrink-0 rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                分析する
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 用途入力（任意） */}
      <input
        type="text"
        value={useCase}
        onChange={(e) => setUseCase(e.target.value)}
        placeholder="用途を入力するとより精度が上がります（例: 毎日持ち歩き用）"
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        disabled={loading}
      />

      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      <p className="text-center text-xs text-gray-400">
        Amazon・楽天市場に対応 · 無料で5回まで利用可能
      </p>
    </form>
  )
}
