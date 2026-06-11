// ================================================================
// 「後悔予測」ドメイン型
// レビュー要約ではなく、購入後の後悔を予測するためのモデル
// ================================================================

// ── 購入者プロファイル（ユーザー入力）─────────────────────────

export interface BuyerProfile {
  useCase: string           // 用途: 「毎日の通勤カバンに入れたい」
  usageFrequency: UsageFrequency
  budget: number            // 予算上限（円）
  priorities: Priority[]    // 重視する点
  dealbreakers: string[]    // 絶対に許せない点
}

export type UsageFrequency = 'daily' | 'weekly' | 'occasional' | 'one_time'

export type Priority =
  | 'durability'   // 耐久性
  | 'portability'  // 携帯性
  | 'performance'  // 性能
  | 'design'       // デザイン
  | 'price'        // 価格
  | 'support'      // サポート

// ── 後悔予測の時系列モデル ────────────────────────────────────

export type RegretHorizon =
  | 'week_1'    // 1週間以内（開封直後）
  | 'month_1'   // 1ヶ月以内
  | 'month_3'   // 3ヶ月以内
  | 'month_6'   // 6ヶ月以内
  | 'year_1'    // 1年以内

// 時系列ごとの後悔確率
export interface RegretTimeline {
  horizon: RegretHorizon
  probability: number    // 0〜100 (%)
  triggerEvent: string   // 後悔を引き起こす出来事の予測
  evidence: string       // 根拠となるレビューパターン
}

// ── 後悔シナリオ（具体的な未来予測）─────────────────────────

export type RegretScenarioType =
  | 'performance_gap'  // 期待したスペックを実際の使用感が下回る
  | 'durability'       // 想定より早く劣化・故障
  | 'use_case_fit'     // 用途に合わなかった
  | 'size_weight'      // サイズ・重量の想定ズレ
  | 'price_value'      // 価格に見合わなかった
  | 'better_exists'    // より良い選択肢があった

export interface RegretScenario {
  type: RegretScenarioType
  title: string               // 「持ち歩くには重すぎる」
  narrative: string           // 「購入から2週間、毎日カバンに入れると...」
  probability: number         // このシナリオが発生する確率 0〜100
  horizon: RegretHorizon      // いつ発生するか
  affectedBuyerRatio: number  // 同じ用途の購入者のうち何%が後悔したか
  preventionTip: string       // このシナリオを避けるには
}

// ── 購入者タイプマッチング ────────────────────────────────────

// 「後悔した人」と「満足した人」のプロファイルを抽出し
// ユーザーがどちらに近いかを判定する
export interface BuyerArchetype {
  type: 'regret' | 'satisfied'
  label: string             // 「毎日持ち歩いて後悔した人」
  profile: string           // そのアーキタイプの特徴
  matchScore: number        // ユーザーとの一致度 0〜100
  sampleQuotes: string[]    // 代表的なレビュー引用
}

// ── 最終予測結果 ──────────────────────────────────────────────

export type Verdict =
  | 'buy'           // 買うべき（後悔リスク低）
  | 'buy_with_note' // 条件付きで買うべき
  | 'wait'          // もう少し待つべき（価格・新モデル等）
  | 'skip'          // やめておくべき
  | 'buy_alternative' // 代替品を買うべき

export interface PredictionVerdict {
  verdict: Verdict
  headline: string          // 「あなたは6ヶ月以内に後悔する可能性が高い」
  confidence: number        // 予測の信頼度 0〜100
  oneLineSummary: string    // 購入判断を一言で
  conditions: string[]      // この予測が成立する条件
}

// ── メイン予測モデル ──────────────────────────────────────────

export interface RegretPrediction {
  // 総合後悔確率（購入後1年以内）
  overallRegretProbability: number

  // 時系列予測
  timeline: RegretTimeline[]

  // 後悔シナリオ（確率の高い順）
  scenarios: RegretScenario[]

  // 購入者アーキタイプマッチング
  archetypes: BuyerArchetype[]

  // 最終判定
  verdict: PredictionVerdict

  // 分析メタデータ
  basedOnReviewCount: number
  predictionGeneratedAt: string
}
