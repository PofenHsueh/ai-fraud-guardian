export const MAX_EVIDENCE_ITEMS = 10
export const MAX_TEXT_LENGTH = 1000
// 主動提醒的示範用條件，真實觸發條件尚未定義
export const PROACTIVE_ALERT_THRESHOLD = 50_000

export function isValidUrlInput(input: string): boolean {
  const value = input.trim()
  return value.length > 0 && !/\s/.test(value) && value.includes('.')
}

export function isValidTextInput(input: string): boolean {
  const value = input.trim()
  return value.length > 0 && value.length <= MAX_TEXT_LENGTH
}

export function canAddEvidence(count: number): boolean {
  return count < MAX_EVIDENCE_ITEMS
}

export function canStartAnalysis(count: number, consented: boolean): boolean {
  return count > 0 && consented
}

export function shouldShowProactiveAlert(amount: number | null): boolean {
  return amount !== null && amount >= PROACTIVE_ALERT_THRESHOLD
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
