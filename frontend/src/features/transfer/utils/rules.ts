import { PROACTIVE_ALERT_THRESHOLD } from '@/config/limits'

export const shouldShowProactiveAlert = (amount: number | null): boolean => {
  return amount !== null && amount >= PROACTIVE_ALERT_THRESHOLD
}
