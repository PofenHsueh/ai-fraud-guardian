import { BRAND_COLOR, BRAND_TINT } from '@/config/theme'
import type { Decision, RiskLevel } from '@/types/analysis'

type RiskLevelDisplay = {
  label: string
  // 風險框與主要按鈕的顏色：main 為文字、框線與按鈕底色，tint 為風險框底色
  tone: { main: string; tint: string }
  // 主要按鈕交出「暫停」或「繼續」，按鈕文字只是呈現
  primary: { label: string; decision: Decision }
  secondary: { label: string; decision: Decision }
}

const cautious = {
  primary: { label: '暫停並離開', decision: 'paused' },
  secondary: { label: '我了解風險，仍要繼續轉帳', decision: 'continued' },
} as const

export const riskLevels: Record<RiskLevel, RiskLevelDisplay> = {
  HIGH: { label: '高風險', tone: { main: '#b42318', tint: '#fef3f2' }, ...cautious },
  MEDIUM_HIGH: { label: '中高風險', tone: { main: '#b4441a', tint: '#fdf1ea' }, ...cautious },
  MEDIUM: { label: '中風險', tone: { main: '#8a5a00', tint: '#fdf6e7' }, ...cautious },
  LOW: {
    label: '低風險',
    tone: { main: BRAND_COLOR, tint: BRAND_TINT },
    primary: { label: '繼續轉帳', decision: 'continued' },
    secondary: { label: '取消這筆轉帳', decision: 'paused' },
  },
}
