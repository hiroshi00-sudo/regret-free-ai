import type { DiagnosisResult } from './diagnosis'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          plan: 'free' | 'pro'
          monthly_analysis_count: number
          monthly_reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      products: {
        Row: {
          id: string
          url: string
          platform: string
          asin: string | null
          title: string
          price: number | null
          image_url: string | null
          category: string | null
          review_count: number
          avg_rating: number | null
          fetched_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          source: string
          external_id: string | null
          rating: number | null
          title: string | null
          body: string
          is_negative: boolean
          negative_categories: string[] | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      analyses: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          status: 'pending' | 'analyzing' | 'done' | 'error'
          use_case: string | null
          overall_score: number | null
          score_durability: number | null
          score_expectation_gap: number | null
          score_price_regret: number | null
          score_use_case_mismatch: number | null
          negative_insights: Record<string, unknown> | null
          alternative_product_ids: string[] | null
          ai_model: string | null
          error_message: string | null
          result: DiagnosisResult | null
          completed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analyses']['Row'], 'id' | 'created_at'>
        Update: Partial<{
          user_id: string | null
          product_id: string
          status: 'pending' | 'analyzing' | 'done' | 'error'
          use_case: string | null
          overall_score: number | null
          score_durability: number | null
          score_expectation_gap: number | null
          score_price_regret: number | null
          score_use_case_mismatch: number | null
          negative_insights: Record<string, unknown>[] | null
          alternative_product_ids: string[] | null
          ai_model: string | null
          error_message: string | null
          result: unknown
          completed_at: string | null
        }>
      }
    }
  }
}
