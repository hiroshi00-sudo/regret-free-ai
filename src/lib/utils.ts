import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function detectPlatform(url: string): 'amazon' | 'rakuten' | 'other' {
  if (url.includes('amazon.co.jp') || url.includes('amazon.com')) return 'amazon'
  if (url.includes('rakuten.co.jp')) return 'rakuten'
  return 'other'
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    // Amazon: dp/ASIN だけに正規化
    const dpMatch = u.pathname.match(/\/dp\/([A-Z0-9]{10})/)
    if (dpMatch?.[1]) {
      return `https://www.amazon.co.jp/dp/${dpMatch[1]}`
    }
    return `${u.origin}${u.pathname}`
  } catch {
    return url
  }
}

export function extractAsin(url: string): string | undefined {
  const match = url.match(/\/dp\/([A-Z0-9]{10})/)
  return match?.[1]
}
