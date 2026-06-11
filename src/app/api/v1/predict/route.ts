import { NextRequest, NextResponse } from 'next/server'
import { predictRegret } from '@/lib/openai/prompts/predictRegret'
import { normalizeUrl, detectPlatform } from '@/lib/utils'
import type { BuyerProfile } from '@/types/prediction'
import type { RegretPrediction } from '@/types/prediction'

export interface PredictRequest {
  url: string
  buyerProfile: BuyerProfile
}

export interface PredictResponse {
  prediction: RegretPrediction
  product: { url: string; title: string; platform: string }
}

// ── モックレビュー（本番では DB / スクレイパーから取得）────────
function getMockReviews(count = 60) {
  const pool = [
    { rating: 5, body: '非常に満足しています。品質が高く使いやすいです。毎日使っています。' },
    { rating: 5, body: 'コスパが良く期待以上でした。友人にも勧めています。' },
    { rating: 5, body: '軽くて持ち運びやすいです。デザインも好みです。' },
    { rating: 4, body: '概ね満足ですが、もう少し軽ければ言うことなし。' },
    { rating: 4, body: '品質は良いですが、付属品が少ないです。' },
    { rating: 3, body: '普通の商品です。可もなく不可もなく。値段相応かな。' },
    { rating: 3, body: '悪くはないけど、もう少し安ければ星4でした。' },
    { rating: 2, body: '思っていたよりサイズが大きくて毎日持ち歩きには不向きでした。重さも想定外。' },
    { rating: 2, body: '3ヶ月で動作が不安定になりました。耐久性に疑問です。' },
    { rating: 1, body: '購入後8ヶ月で完全に壊れました。保証期間内だったので交換してもらいましたが不信感。' },
    { rating: 1, body: '毎日カバンに入れて通勤していたら半年で劣化。重くて腰も痛くなりました。後悔しています。' },
    { rating: 1, body: '値段の割に品質が低い。もっと調べてから買えばよかった。返品したかった。' },
  ]
  return Array.from({ length: count }, (_, i) => ({
    ...pool[i % pool.length]!,
    title: `購入者レビュー${i + 1}`,
    reviewedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0],
  }))
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PredictRequest

    if (!body.url || !body.buyerProfile?.useCase) {
      return NextResponse.json(
        { error: 'url and buyerProfile.useCase are required' },
        { status: 400 },
      )
    }

    const normalizedUrl = normalizeUrl(body.url)
    const platform      = detectPlatform(normalizedUrl)
    const reviews       = getMockReviews(60)

    const prediction = await predictRegret({
      productTitle:    '商品',   // 本番: DB or スクレイパーから取得
      productCategory: 'その他',
      buyerProfile:    {
        useCase:         body.buyerProfile.useCase,
        usageFrequency:  body.buyerProfile.usageFrequency,
        priorities:      body.buyerProfile.priorities.map(String),
        dealbreakers:    body.buyerProfile.dealbreakers,
      },
      reviews,
    })

    const response: PredictResponse = {
      prediction,
      product: { url: normalizedUrl, title: '商品', platform },
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error('POST /api/v1/predict', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'Internal server error', detail: message },
      { status: 500 },
    )
  }
}
