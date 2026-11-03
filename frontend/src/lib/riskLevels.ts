import type { Decision, RiskLevel } from '../types/analysis'

type RiskLevelDisplay = {
  label: string
  // antd Tag 的預設色名
  color: 'red' | 'orange' | 'gold' | 'green'
  // 主要按鈕交出「暫停」或「繼續」，按鈕文字只是呈現
  primary: { label: string; decision: Decision }
  secondary: { label: string; decision: Decision }
}

const cautious = {
  primary: { label: '暫停並離開', decision: 'paused' },
  secondary: { label: '我了解風險，仍要繼續轉帳', decision: 'continued' },
} as const

export const riskLevels: Record<RiskLevel, RiskLevelDisplay> = {
  HIGH: { label: '高風險', color: 'red', ...cautious },
  MEDIUM_HIGH: { label: '中高風險', color: 'orange', ...cautious },
  MEDIUM: { label: '中風險', color: 'gold', ...cautious },
  LOW: {
    label: '低風險',
    color: 'green',
    primary: { label: '繼續轉帳', decision: 'continued' },
    secondary: { label: '取消這筆轉帳', decision: 'paused' },
  },
}
