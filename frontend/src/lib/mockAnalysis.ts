import type { AnalysisResult, AnalysisView } from '../types/analysis'

// 示範用假資料，欄位依設計文件 6.2；串接層替換 useAnalysisView 後不再使用

const mediumHigh: AnalysisResult = {
  riskLevel: 'MEDIUM_HIGH',
  fraudType: '疑似假投資詐騙',
  signals: [
    '對話中出現保證獲利話術',
    '要求私下加 LINE 匯款',
    // 用來確認 AI 內容以純文字顯示，角括號應原樣出現
    '訊息附上「<b>點此</b>領取獎金」的連結',
  ],
  suggestion: '暫緩匯款，不要開啟 reurl.cc/abc123，並撥打 165 查證',
}

const lowResult: AnalysisResult = {
  riskLevel: 'LOW',
  fraudType: '未發現明顯詐騙特徵',
  signals: ['無法從提供的資料確認收款人身分'],
  suggestion: '目前未發現明顯風險，仍請確認收款人身分後再轉帳',
}

const outcomes = {
  high: {
    phase: 'result',
    result: {
      riskLevel: 'HIGH',
      fraudType: '疑似假冒檢警詐騙',
      signals: ['對方自稱檢察官並要求監管帳戶', '要求將存款轉入「安全帳戶」', '要求不得告知家人'],
      suggestion: '這是常見的詐騙手法，請立即停止轉帳，並撥打 165 查證',
    },
  },
  'medium-high': { phase: 'result', result: mediumHigh },
  medium: {
    phase: 'result',
    result: {
      riskLevel: 'MEDIUM',
      fraudType: '疑似網購詐騙',
      signals: ['賣家要求改用私下轉帳付款'],
      suggestion: '請改用平台內建的付款方式交易',
    },
  },
  low: { phase: 'result', result: lowResult },
  'low-empty': { phase: 'result', result: { ...lowResult, signals: [] } },
  failed: { phase: 'failed' },
  blocked: { phase: 'blocked' },
  retrying: { phase: 'result', result: mediumHigh },
} satisfies Record<string, AnalysisView>

export type MockScenario = keyof typeof outcomes

export const mockScenarios = Object.keys(outcomes) as MockScenario[]

export const isMockScenario = (value: string | null): value is MockScenario => {
  return value !== null && value in outcomes
}

export const mockOutcome = (scenario: MockScenario): AnalysisView => {
  return outcomes[scenario]
}

// 守門員頁面重新整理會回到轉帳頁，所以也記住第一次開啟網站時網址上的 ?mock=，
// 例如開啟 /login?mock=failed 後照常走完流程即可
export const initialMockParam = new URLSearchParams(window.location.search).get('mock')
