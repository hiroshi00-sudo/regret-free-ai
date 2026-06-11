import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { DiagnoseResultResponse } from '@/types/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any

  const { data, error } = await supabase
    .from('analyses')
    .select(`
      id,
      status,
      use_case,
      result,
      error_message,
      completed_at,
      created_at,
      products (
        id,
        url,
        platform,
        asin,
        title,
        price,
        image_url,
        category,
        review_count,
        avg_rating
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const product = Array.isArray(data.products) ? data.products[0] : data.products

  const response: DiagnoseResultResponse = {
    diagnosisId: data.id,
    status:      data.status,
    product: {
      id:          product?.id ?? '',
      url:         product?.url ?? '',
      platform:    (product?.platform ?? 'other') as 'amazon' | 'rakuten' | 'other',
      asin:        product?.asin ?? undefined,
      title:       product?.title ?? '',
      price:       product?.price ?? undefined,
      imageUrl:    product?.image_url ?? undefined,
      category:    product?.category ?? undefined,
      reviewCount: product?.review_count ?? 0,
      avgRating:   product?.avg_rating ?? undefined,
    },
    result: (data.result as DiagnoseResultResponse['result']) ?? null,
    error:  data.error_message ?? null,
  }

  return NextResponse.json(response)
}
