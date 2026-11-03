import { createContext, useContext } from 'react'
import type { EvidenceItem, EvidenceSubmission, GuardianMode } from '../types/evidence'
import type { TransferDraft } from '../types/transfer'

export type GuardianFlowValue = {
  mode: GuardianMode | null
  items: EvidenceItem[]
  consented: boolean
  transferDraft: TransferDraft
  submission: EvidenceSubmission | null
  startGuardian: (mode: GuardianMode) => void
  addItem: (item: EvidenceItem) => void
  removeItem: (id: string) => void
  clearItems: () => void
  setConsented: (consented: boolean) => void
  setTransferDraft: (draft: TransferDraft) => void
  setSubmission: (submission: EvidenceSubmission) => void
}

export const GuardianFlowContext = createContext<GuardianFlowValue | null>(null)

export function useGuardianFlow(): GuardianFlowValue {
  const value = useContext(GuardianFlowContext)
  if (!value) throw new Error('useGuardianFlow 必須在 GuardianFlowProvider 內使用')
  return value
}
