import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { DiagnosisPolling } from '@/components/features/diagnose/DiagnosisPolling'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DiagnosePage({ params }: Props) {
  const { id } = await params

  return (
    <>
      {/* ナビゲーション */}
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <ShieldCheck className="h-4 w-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              後悔しないAI
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            別の商品を分析
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <DiagnosisPolling diagnosisId={id} />
      </main>

      {/* フッター */}
      <footer className="mt-8 border-t border-gray-100 px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="text-xs text-gray-400">© 2025 後悔しないAI</p>
          <Link
            href="/"
            className="text-xs text-gray-400 transition-colors hover:text-gray-700"
          >
            別の商品を分析する →
          </Link>
        </div>
      </footer>
    </>
  )
}
