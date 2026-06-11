'use client'

import { ArrowRight, CheckCircle2, Zap, BarChart2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/Header'
import { DiagnoseForm } from '@/components/features/diagnose/DiagnoseForm'

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="hero-gradient px-6 pb-32 pt-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-7 animate-fade-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 inline-block" />
                AIによる購入判断サポート
              </span>
            </div>

            <h1 className="mb-6 animate-fade-up text-5xl font-semibold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl"
                style={{ animationDelay: '0.1s' }}>
              買う前に、<br className="sm:hidden" />後悔を知る。
            </h1>

            <p className="mx-auto mb-12 max-w-xl animate-fade-up text-lg leading-relaxed text-gray-500"
               style={{ animationDelay: '0.2s' }}>
              商品URLを貼るだけ。100件のレビューをAIが解析し、
              あなたがその商品を買って後悔しないかを判定します。
            </p>

            <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <DiagnoseForm />
            </div>
          </div>
        </section>

        {/* ━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="how" className="px-6 py-28">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-gray-900">
                3ステップで完了
              </h2>
              <p className="text-sm text-gray-500">
                URLを貼るだけ。最短30秒で判定結果が届きます
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.step}
                  className="rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100"
                >
                  <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${step.iconBg}`}>
                    <step.Icon className={`h-5 w-5 ${step.iconColor}`} />
                  </div>
                  <p className={`mb-2 text-xs font-semibold tracking-wide ${step.labelColor}`}>
                    STEP {step.step}
                  </p>
                  <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="features" className="bg-gray-50/60 px-6 py-28">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-3 text-3xl font-semibold tracking-tight text-gray-900">
                レビュー要約とは違います
              </h2>
              <p className="mx-auto max-w-md text-sm text-gray-500">
                ポジティブな情報ではなく、「あなたが後悔するか」に特化した分析
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-gray-100 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100"
                >
                  <div className="mb-4 text-2xl">{f.emoji}</div>
                  <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="px-6 py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-5 text-4xl font-semibold tracking-tight text-gray-900">
              悩む時間を、<br />確信に変えよう。
            </h2>
            <p className="mb-10 leading-relaxed text-gray-500">
              カートに入れたまま迷っている商品があるなら、<br />
              今すぐURLを貼ってみてください。
            </p>
            <Link
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              無料で分析する
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              無料プラン · クレジットカード不要
            </p>
          </div>
        </section>
      </main>

      {/* ━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-medium text-gray-700">後悔しないAI</p>
          <p className="text-xs text-gray-400">© 2025 後悔しないAI. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

const STEPS = [
  {
    step: 1,
    title: 'URLを貼る',
    description: 'AmazonまたはAmazon・楽天の商品ページのURLをそのまま貼り付けます。',
    Icon: ArrowRight,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    labelColor: 'text-indigo-500',
  },
  {
    step: 2,
    title: 'AIが分析',
    description: '100件のレビューをAIが解析。後悔・故障・ネガティブ情報を自動抽出します。',
    Icon: Zap,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    labelColor: 'text-violet-500',
  },
  {
    step: 3,
    title: '判定を受け取る',
    description: '後悔スコア・リスク詳細・代替品提案を一覧で確認。購入の迷いがなくなります。',
    Icon: CheckCircle2,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    labelColor: 'text-green-600',
  },
] as const

const FEATURES = [
  {
    emoji: '⚠️',
    title: '後悔ポイントを先出し',
    description: '「半年で壊れた」「思ったより小さい」などの時限式・用途起因の後悔を優先して表示。',
  },
  {
    emoji: '🎯',
    title: 'あなたの用途で判定',
    description: '「毎日持ち歩く」などの用途を入力すると、その視点でのミスマッチを検出します。',
  },
  {
    emoji: '📊',
    title: 'ロジックとAIの複合スコア',
    description: '評価分布・故障率・返品率をアルゴリズムで数値化し、AI分析と組み合わせて算出。',
  },
  {
    emoji: '🔄',
    title: '代替品を自動提案',
    description: '後悔スコアが高い場合、同カテゴリのより後悔リスクが低い商品を最大3件提案します。',
  },
] as const
