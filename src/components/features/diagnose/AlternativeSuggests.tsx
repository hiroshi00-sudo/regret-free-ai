import { ExternalLink } from 'lucide-react'
import type { AlternativeProduct } from '@/types/diagnosis'

interface Props {
  alternatives: AlternativeProduct[]
}

export function AlternativeSuggests({ alternatives }: Props) {
  if (alternatives.length === 0) return null

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          後悔リスクが低い代替品
        </p>
        <span className="text-xs text-gray-400">後悔スコア順</span>
      </div>

      <div className="space-y-3">
        {alternatives.map((alt) => (
          <a
            key={alt.product.id}
            href={alt.product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
              📦
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {alt.product.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {alt.reason}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold text-gray-900">{alt.score}</p>
              <ExternalLink className="ml-auto mt-0.5 h-3.5 w-3.5 text-gray-400" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
