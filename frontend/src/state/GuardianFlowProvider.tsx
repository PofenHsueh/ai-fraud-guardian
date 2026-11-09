import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { canAddEvidence } from '../lib/rules'
import type { Decision } from '../types/analysis'
import type { EvidenceItem, EvidenceSubmission, GuardianMode } from '../types/evidence'
import type { TransferDraft } from '../types/transfer'
import { GuardianFlowContext, type GuardianFlowValue } from './guardianFlowContext'

const emptyDraft: TransferDraft = { payee: '', amount: null, note: '' }

const releasePreview = (item: EvidenceItem) => {
  if (item.type === 'image') URL.revokeObjectURL(item.previewUrl)
}

export const GuardianFlowProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<GuardianMode | null>(null)
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [consented, setConsented] = useState(false)
  const [transferDraft, setTransferDraft] = useState<TransferDraft>(emptyDraft)
  const [submission, setSubmission] = useState<EvidenceSubmission | null>(null)
  const [caseId, setCaseId] = useState<string | null>(null)
  const [decision, setDecision] = useState<Decision | null>(null)

  const clearItems = useCallback(() => {
    items.forEach(releasePreview)
    setItems([])
    setConsented(false)
  }, [items])

  const startGuardian = useCallback(
    (nextMode: GuardianMode) => {
      clearItems()
      setSubmission(null)
      setCaseId(null)
      setDecision(null)
      setMode(nextMode)
    },
    [clearItems],
  )

  const addItem = useCallback((item: EvidenceItem) => {
    setItems((prev) => (canAddEvidence(prev.length) ? [...prev, item] : prev))
  }, [])

  const removeItem = useCallback(
    (id: string) => {
      const target = items.find((item) => item.id === id)
      if (target) releasePreview(target)
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [items],
  )

  // 暫停或主動模式繼續：清空轉帳草稿；被動模式繼續：保留草稿，由客戶自己決定是否確認轉帳
  const finishGuardian = useCallback(
    (next: Decision) => {
      const transferCompleted = next === 'continued' && mode === 'active'
      if (next === 'paused' || transferCompleted) setTransferDraft(emptyDraft)
      clearItems()
      setMode(null)
      return transferCompleted
    },
    [mode, clearItems],
  )

  const value = useMemo<GuardianFlowValue>(
    () => ({
      mode,
      items,
      consented,
      transferDraft,
      submission,
      caseId,
      decision,
      startGuardian,
      addItem,
      removeItem,
      clearItems,
      setConsented,
      setTransferDraft,
      setSubmission,
      setCaseId,
      setDecision,
      finishGuardian,
    }),
    [mode, items, consented, transferDraft, submission, caseId, decision, startGuardian, addItem, removeItem, clearItems, finishGuardian],
  )

  return <GuardianFlowContext.Provider value={value}>{children}</GuardianFlowContext.Provider>
}
