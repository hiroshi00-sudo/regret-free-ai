'use client'

import { ArrowRight, Search, Sparkles, CheckCircle2, ShieldCheck, Clock, Target, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared/Header'
import { DiagnoseForm } from '@/components/features/diagnose/DiagnoseForm'

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="bg-white">

        {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="hero-gradient px-6 pb-28 pt-24">
          <div className="mx-auto max-w-3xl text-center">

            {/* Badge */}
            <div className="mb-8 animate-fade-up">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-medium text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block" />
                完全無料 · 登録不要
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mb-6 animate-fade-up text-4xl font-semibold leading-[1.2] tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              style={{ animationDelay: '0.1s' }}
            >
              買う前に、一度だけ<br />
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                確かめてみませんか。
              </span>
            </h1>

            {/* Sub */}
            <p
              className="mx-auto mb-12 max-w-lg animate-fade-up text-base leading-relaxed text-gray-500 sm:text-lg"
              style={{ animationDelay: '0.2s' }}
            >
              商品URLを貼るだけ。AIがレビューを読み解いて、
              その商品があなたに合うかどうかを、やさしく教えてくれます。
            </p>

            {/* Form */}
            <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <DiagnoseForm />
            </div>

            {/* Trust badges */}
            <div
              className="mt-10 animate-fade-up flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400"
              style={{ animationDelay: '0.4s' }}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                個人情報不要
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                最短30秒で結果
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                Amazon・楽天対応
              </span>
            </div>
          </div>
        </section>

        {/* ━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="how" className="px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-14 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">How it works</p>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                たった3ステップで完了
              </h2>
              <p className="text-sm text-gray-400">
                難しい操作は一切ありません。URLを貼るだけです。
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <div
                  key={step.step}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-7 shadow-sm shadow-gray-100/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-indigo-100/60"
                >
                  {/* Connector line (desktop) */}
                  {i < STEPS.length - 1 && (
                    <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 sm:block">
                      <div className="h-px w-6 bg-indigo-100" />
                    </div>
                  )}
                  <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${step.iconBg}`}>
                    <step.Icon className={`h-5 w-5 ${step.iconColor}`} />
                  </div>
                  <p className="mb-2 text-xs font-semibold tracking-widest text-indigo-400">
                    STEP {step.step}
                  </p>
                  <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="features" className="section-tint px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="mb-14 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-400">Features</p>
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                レビューを読む時間、もう不要です
              </h2>
              <p className="mx-auto max-w-md text-sm text-gray-400">
                星の数ではなく「後悔するかどうか」に特化した、Reviqだけの分析
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white bg-white p-7 shadow-sm shadow-indigo-100/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-indigo-100/60"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                    {f.emoji}
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-400">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ SOCIAL PROOF ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-3 text-center">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border border-gray-100 bg-white px-6 py-8 shadow-sm shadow-gray-100/80">
                  <p className="mb-1 text-3xl font-semibold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    {s.value}
                  </p>
                  <p className="text-sm text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="section-tint px-6 py-28">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Get started</p>
            <h2 className="mb-5 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              迷っている商品、<br />一度だけ試してみませんか？
            </h2>
            <p className="mb-10 text-sm leading-relaxed text-gray-400">
              登録なし・クレジットカード不要。<br />
              気になる商品のURLを貼るだけで、すぐに結果が出ます。
            </p>
            <Link
              href="#"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="btn-primary inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-medium text-white"
            >
              <Sparkles className="h-4 w-4" />
              無料で確かめる
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              無料プラン · 5回まで利用可能 · いつでもやめられます
            </p>
          </div>
        </section>
      </main>

      {/* ━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer className="border-t border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md btn-primary">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1.5L2 4.5V9.5L7 12.5L12 9.5V4.5L7 1.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M7 5V9M5 7H9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">Reviq</span>
          </div>
          <p className="text-xs text-gray-400">© 2025 Reviq. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

const STEPS = [
  {
    step: 1,
    title: 'URLを貼り付ける',
    description: 'Amazon・楽天の商品ページのURLをそのまま貼るだけ。コピペで完了です。',
    Icon: Search,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
  },
  {
    step: 2,
    title: 'AIが静かに分析',
    description: 'レビューをAIが読み込み、後悔・故障・使いにくさを自動で整理します。',
    Icon: Sparkles,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
  {
    step: 3,
    title: '結果をやさしく確認',
    description: '「あなたに合うかどうか」をスコアとコメントで、わかりやすくお伝えします。',
    Icon: CheckCircle2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
] as const

const FEATURES = [
  {
    emoji: '🔍',
    title: '後悔ポイントを先出しで確認',
    description: '「半年で壊れた」「思ったより小さかった」など、時間が経ってから気づく後悔を事前に教えます。',
  },
  {
    emoji: '🎯',
    title: 'あなたの使い方で判定',
    description: '「毎日持ち歩く」などひとこと入力するだけで、あなたの用途に合った視点で分析します。',
  },
  {
    emoji: '📊',
    title: 'スコアで直感的に把握',
    description: '複雑なレビューを読まなくても、後悔リスクをスコアでひと目で確認できます。',
  },
  {
    emoji: '💡',
    title: 'より良い代替品を提案',
    description: 'リスクが高い場合は、同じ目的で後悔しにくい商品を最大3件、自動でご提案します。',
  },
] as const

const STATS = [
  { value: '100件+', label: '解析するレビュー数' },
  { value: '30秒', label: '平均の判定時間' },
  { value: '無料', label: '5回まで使い放題' },
] as const
