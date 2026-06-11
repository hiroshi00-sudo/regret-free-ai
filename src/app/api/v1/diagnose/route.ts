import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { normalizeUrl, detectPlatform, extractAsin } from '@/lib/utils'
import type { DiagnoseRequest, DiagnoseResponse } from '@/types/api'
import { runAnalysisPipeline } from '../_pipeline'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DiagnoseRequest

    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    const normalizedUrl = normalizeUrl(body.url)
    const platform      = detectPlatform(normalizedUrl)
    const asin          = extractAsin(normalizedUrl)
    const supabase      = createServiceClient()

    // 商品を UPSERT（同一URL は再利用）
    const { data: product, error: productError } = await supabase
      .from('products')
      .upsert(
        {
          url:          normalizedUrl,
          platform,
          asin:         asin ?? null,
          title:        '取得中...',
          review_count: 0,
          fetched_at:   new Date().toISOString(),
        },
        { onConflict: 'url', ignoreDuplicates: false },
      )
      .select()
      .single()

    if (productError || !product) {
      console.error('product upsert error', productError)
      return NextResponse.json({ error: 'Failed to save product' }, { status: 500 })
    }

    // 分析レコードを作成
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        product_id: product.id,
        user_id:    null,
        status:     'pending',
        use_case:   body.useCase ?? null,
        result:     null,
      })
      .select()
      .single()

    if (analysisError || !analysis) {
      console.error('analysis insert error', analysisError)
      return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 })
    }

    // 非同期でパイプラインを実行（レスポンスは待たない）
    void runAnalysisPipeline({
      analysisId:    analysis.id,
      productId:     product.id,
      productUrl:    normalizedUrl,
      platform,
      useCase:       body.useCase,
    })

    const response: DiagnoseResponse = {
      diagnosisId: analysis.id,
      status:      'pending',
    }

    return NextResponse.json(response, { status: 202 })
  } catch (err) {
    console.error('POST /api/v1/diagnose', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
