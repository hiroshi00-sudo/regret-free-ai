import type { ScoreBreakdown, ScoreGrade } from '@/types/diagnosis'

export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

export interface ScoringInput {
  reviewStats: {
    totalCount: number
    avgRating: number
    ratingDist: RatingDistribution
  }
  aiInsights: {
    negativeCount: number
    hasFailureReport: boolean
    failureCount: number
    regretCount: number
    returnCount: number
  }
  useCaseMismatch?: boolean
}

const WEIGHTS = {
  rating: 0.25,
  reviewVolume: 0.10,
  negativeRate: 0.30,
  failureRate: 0.20,
  regretRate: 0.15,
} as const

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function calcRatingScore(avgRating: number, dist: RatingDistribution): number {
  const total = Object.values(dist).reduce((s, n) => s + n, 0)
  if (total === 0) return 50
  const base = ((avgRating - 1) / 4) * 100
  const lowRatingRate = (dist[1] + dist[2]) / total
  const penalty = lowRatingRate * 30
  const inflationAdj = avgRating > 4.5 ? (avgRating - 4.5) * 0.3 : 0
  return clamp(base - penalty - inflationAdj, 0, 100)
}

function calcReviewVolumeScore(count: number): number {
  if (count <= 0) return 0
  if (count >= 500) return 100
  return clamp((Math.log(count) / Math.log(500)) * 100, 0, 100)
}

function calcNegativeRateScore(negativeCount: number, totalCount: number): number {
  if (totalCount === 0) return 50
  const rate = negativeCount / totalCount
  return clamp(100 * Math.pow(Math.max(0, 1 - 2 * rate), 2), 0, 100)
}

function calcFailureRateScore(
  hasFailureReport: boolean,
  failureCount: number,
  totalCount: number,
): number {
  if (!hasFailureReport || totalCount === 0) return 100
  const rate = failureCount / totalCount
  return clamp(100 - 20 - rate * 200, 0, 100)
}

function calcRegretRateScore(
  regretCount: number,
  returnCount: number,
  totalCount: number,
): number {
  if (totalCount === 0) return 50
  const weightedCount = regretCount + returnCount * 2
  const rate = weightedCount / totalCount
  return clamp(100 * Math.exp(-5 * rate), 0, 100)
}

function calcReliabilityFactor(totalCount: number): number {
  if (totalCount >= 50) return 1.0
  if (totalCount <= 3) return 0.5
  return 0.5 + ((totalCount - 3) / (50 - 3)) * 0.5
}

function calcBiasFactor(dist: RatingDistribution): number {
  const total = Object.values(dist).reduce((s, n) => s + n, 0)
  if (total === 0) return 1.0
  const fiveStarRate = dist[5] / total
  if (fiveStarRate >= 0.8) return 0.85
  if (fiveStarRate >= 0.7) return 0.92
  if (fiveStarRate >= 0.6) return 0.96
  return 1.0
}

function calcGrade(score: number): { grade: ScoreGrade; label: string } {
  if (score >= 85) return { grade: 'S', label: '強くおすすめ' }
  if (score >= 70) return { grade: 'A', label: 'おすすめ' }
  if (score >= 55) return { grade: 'B', label: '条件付きでおすすめ' }
  if (score >= 40) return { grade: 'C', label: 'やや注意が必要' }
  if (score >= 25) return { grade: 'D', label: 'おすすめしない' }
  return { grade: 'F', label: '購入を避けることを推奨' }
}

export function calcPurchaseScore(input: ScoringInput): ScoreBreakdown {
  const { reviewStats, aiInsights, useCaseMismatch } = input
  const { totalCount, avgRating, ratingDist } = reviewStats

  const ratingScore       = calcRatingScore(avgRating, ratingDist)
  const reviewVolumeScore = calcReviewVolumeScore(totalCount)
  const negativeRateScore = calcNegativeRateScore(aiInsights.negativeCount, totalCount)
  const failureRateScore  = calcFailureRateScore(
    aiInsights.hasFailureReport,
    aiInsights.failureCount,
    totalCount,
  )
  const regretRateScore   = calcRegretRateScore(
    aiInsights.regretCount,
    aiInsights.returnCount,
    totalCount,
  )

  const weightedTotal =
    ratingScore       * WEIGHTS.rating +
    reviewVolumeScore * WEIGHTS.reviewVolume +
    negativeRateScore * WEIGHTS.negativeRate +
    failureRateScore  * WEIGHTS.failureRate +
    regretRateScore   * WEIGHTS.regretRate

  const reliabilityFactor  = calcReliabilityFactor(totalCount)
  const biasFactor         = calcBiasFactor(ratingDist)
  const reliabilityAdjusted = weightedTotal * reliabilityFactor + 50 * (1 - reliabilityFactor)
  const biasAdjusted        = reliabilityAdjusted * biasFactor
  const mismatchPenalty     = useCaseMismatch ? 15 : 0
  const finalScore          = clamp(Math.round(biasAdjusted - mismatchPenalty), 0, 100)

  const { grade, label } = calcGrade(finalScore)
  const confidence =
    totalCount >= 50 ? 'high' : totalCount >= 15 ? 'medium' : 'low'

  return {
    ratingScore:       Math.round(ratingScore),
    reviewVolumeScore: Math.round(reviewVolumeScore),
    negativeRateScore: Math.round(negativeRateScore),
    failureRateScore:  Math.round(failureRateScore),
    regretRateScore:   Math.round(regretRateScore),
    weightedTotal:     Math.round(weightedTotal),
    reliabilityFactor: Math.round(reliabilityFactor * 100) / 100,
    biasFactor:        Math.round(biasFactor * 100) / 100,
    finalScore,
    grade,
    label,
    confidence,
  }
}
