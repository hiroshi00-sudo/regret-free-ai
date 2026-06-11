import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '買って後悔しないAI',
  description: '商品URLを貼るだけ。100件のレビューをAIが解析し、購入後に後悔しないかを判定します。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white text-gray-900">{children}</body>
    </html>
  )
}
