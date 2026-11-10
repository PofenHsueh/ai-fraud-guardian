import { MAX_EVIDENCE_ITEMS, MAX_TEXT_LENGTH } from '@/config/limits'

export const isValidUrlInput = (input: string): boolean => {
  const value = input.trim()
  return value.length > 0 && !/\s/.test(value) && value.includes('.')
}

export const isValidTextInput = (input: string): boolean => {
  const value = input.trim()
  return value.length > 0 && value.length <= MAX_TEXT_LENGTH
}

export const canAddEvidence = (count: number): boolean => {
  return count < MAX_EVIDENCE_ITEMS
}

export const canStartAnalysis = (count: number, consented: boolean): boolean => {
  return count > 0 && consented
}

export const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
