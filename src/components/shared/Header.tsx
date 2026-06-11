import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-indigo-50 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1.5L2 4.5V9.5L7 12.5L12 9.5V4.5L7 1.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M7 5V9M5 7H9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            Reviq
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-7 text-sm text-gray-500 sm:flex">
          <Link href="/#how" className="transition-colors hover:text-gray-900">
            使い方
          </Link>
          <Link href="/#features" className="transition-colors hover:text-gray-900">
            特徴
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="/"
          className="btn-primary rounded-full px-4 py-1.5 text-sm font-medium text-white"
        >
          無料で試す
        </Link>
      </div>
    </header>
  )
}
