'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

export function DiagnoseForm() {
  const router  = useRouter()
  const [url, setUrl]         = useState('')
  const [useCase, setUseCase] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    router.push(`/predict?url=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-3">
      {/* URL入力 */}
      <div className="glass rounded-2xl p-2 shadow-lg shadow-indigo-100/50">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Amazon / 楽天の商品URLを貼り付ける"
            className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="btn-primary shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                確かめる
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 用途入力（任意） */}
      <input
        type="text"
        value={useCase}
        onChange={(e) => setUseCase(e.target.value)}
        placeholder="使い方を教えるとより精度が上がります（例：毎日職場に持ち歩く）"
        className="w-full rounded-xl border border-indigo-100 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
        disabled={loading}
      />

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}

      <p className="text-center text-xs text-gray-400">
        Amazon・楽天市場に対応 · 無料で5回まで · 登録不要
      </p>
    </form>
  )
}
