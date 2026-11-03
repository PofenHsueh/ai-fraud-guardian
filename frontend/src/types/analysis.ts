// 結果畫面（①）與串接層（③）共用的資料型別
// result 欄位與設計文件 6.2 的 result 同名；403／429／逾時由串接層判斷後轉成 phase

export type RiskLevel = 'LOW' | 'MEDIUM' | 'MEDIUM_HIGH' | 'HIGH'

export type AnalysisResult = {
  riskLevel: RiskLevel
  fraudType: string
  signals: string[]
  suggestion: string
}

export type AnalysisView =
  | { phase: 'analyzing'; retrying: boolean }
  | { phase: 'result'; result: AnalysisResult }
  // 分析失敗（FAILED）或輪詢逾時
  | { phase: 'failed' }
  // 請求被 WAF 拒絕（403）
  | { phase: 'blocked' }

export type Decision = 'paused' | 'continued'
