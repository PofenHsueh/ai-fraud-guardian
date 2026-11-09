import { createContext, useContext } from 'react'
import type { Decision } from '../types/analysis'
import type { EvidenceItem, EvidenceSubmission, GuardianMode } from '../types/evidence'
import type { TransferDraft } from '../types/transfer'

export type GuardianFlowValue = {
  mode: GuardianMode | null
  items: EvidenceItem[]
  consented: boolean
  transferDraft: TransferDraft
  submission: EvidenceSubmission | null
  caseId: string | null
  // 最近一次交出的決策，下次進入守門員時清空
  decision: Decision | null
  startGuardian: (mode: GuardianMode) => void
  addItem: (item: EvidenceItem) => void
  removeItem: (id: string) => void
  clearItems: () => void
  setConsented: (consented: boolean) => void
  setTransferDraft: (draft: TransferDraft) => void
  setSubmission: (submission: EvidenceSubmission) => void
  setCaseId: (caseId: string | null) => void
  setDecision: (decision: Decision) => void
  // 結束守門員流程並清理狀態；回傳 true 表示應顯示轉帳完成
  finishGuardian: (decision: Decision) => boolean
}

export const GuardianFlowContext = createContext<GuardianFlowValue | null>(null)

export const useGuardianFlow = (): GuardianFlowValue => {
  const value = useContext(GuardianFlowContext)
  if (!value) throw new Error('useGuardianFlow 必須在 GuardianFlowProvider 內使用')
  return value
}
