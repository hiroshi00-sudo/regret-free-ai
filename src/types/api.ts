import type { Diagnosis, DiagnosisStatus, ProductSummary, DiagnosisResult } from './diagnosis'

export interface DiagnoseRequest {
  url: string
  useCase?: string
}

export interface DiagnoseResponse {
  diagnosisId: string
  status: DiagnosisStatus
}

export interface DiagnoseResultResponse {
  diagnosisId: string
  status: DiagnosisStatus
  product: ProductSummary
  result: DiagnosisResult | null
  error: string | null
}

export type { Diagnosis }
