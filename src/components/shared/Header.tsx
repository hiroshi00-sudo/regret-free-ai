import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function Header() {
  return (
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

        <nav className="hidden items-center gap-7 text-sm text-gray-500 sm:flex">
          <Link href="/#how" className="transition-colors hover:text-gray-900">
            使い方
          </Link>
          <Link href="/#features" className="transition-colors hover:text-gray-900">
            機能
          </Link>
        </nav>

        <Link
          href="/"
          className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          試してみる
        </Link>
      </div>
    </header>
  )
}
