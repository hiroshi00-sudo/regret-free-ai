export type Platform = 'amazon' | 'rakuten' | 'other'

export type DiagnosisStatus = 'pending' | 'analyzing' | 'done' | 'error'

export type RecommendLevel =
  | 'strongly_recommend'
  | 'recommend'
  | 'conditional'
  | 'not_recommend'
  | 'strongly_not_recommend'

export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export type RiskLevel = 'low' | 'medium' | 'high'

export type RegretTiming = 'immediate' | 'short_term' | 'long_term' | 'unknown'

export type NegativeCategory =
  | 'durability'
  | 'size'
  | 'quality'
  | 'price'
  | 'usability'
  | 'other'

// ── 商品 ─────────────────────────────────────────────────────

export interface ProductSummary {
  id: string
  url: string
  asin?: string
  platform: Platform
  title: string
  price?: number
  imageUrl?: string
  category?: string
  reviewCount: number
  avgRating?: number
}

// ── AIアウトプット ─────────────────────────────────────────────

export interface ReviewEvidence {
  quote: string
  count: number
}

export interface InsightItem {
  title: string
  detail: string
  evidences: ReviewEvidence[]
}

export interface RegretPoint {
  title: string
  detail: string
  timing: RegretTiming
  severity: RiskLevel
  evidences: ReviewEvidence[]
  // 頻度情報
  mentionCount: number     // このポイントに言及したレビュー件数
  frequencyRate: number    // 全レビューに対する割合 0〜100 (%)
  rank: number             // 頻度順の順位 1〜5
}

export interface PersonaItem {
  label: string
  reason: string
}

// 後悔率の算出根拠となるネガティブ要素
export interface RegretFactor {
  label: string        // 例: "重い"、"バッテリーが短い"
  reviewCount: number  // 該当レビュー件数
  weight: number       // 後悔率への寄与度 0.0〜1.0
}

export interface RegretRate {
  rate: number              // 0〜100 (%)
  factors: RegretFactor[]   // 算出根拠のリスト
  level: 'low' | 'medium' | 'high'  // low<15%, medium<35%, high>=35%
}

export interface AiAnalysis {
  pros: InsightItem[]
  cons: InsightItem[]
  regretPoints: RegretPoint[]
  goodFor: PersonaItem[]
  badFor: PersonaItem[]
  recommendLevel: RecommendLevel
  recommendReason: string
  summary: string
  confidence: number
  analyzedReviewCount: number
  regretRate: RegretRate
}

// ── スコアリング ──────────────────────────────────────────────

export interface ScoreBreakdown {
  ratingScore: number
  reviewVolumeScore: number
  negativeRateScore: number
  failureRateScore: number
  regretRateScore: number
  weightedTotal: number
  reliabilityFactor: number
  biasFactor: number
  finalScore: number
  grade: ScoreGrade
  label: string
  confidence: 'low' | 'medium' | 'high'
}

// ── 代替品 ────────────────────────────────────────────────────

export interface AlternativeProduct {
  product: ProductSummary
  score: number
  reason: string
  rank: number
}

// ── 診断セッション ────────────────────────────────────────────

export interface DiagnosisResult {
  aiAnalysis: AiAnalysis
  scoreBreakdown: ScoreBreakdown
  alternatives: AlternativeProduct[]
  analyzedAt: string
}

export interface Diagnosis {
  id: string
  status: DiagnosisStatus
  product: ProductSummary
  useCase?: string
  result: DiagnosisResult | null
  error?: string
  createdAt: string
  completedAt?: string
}
