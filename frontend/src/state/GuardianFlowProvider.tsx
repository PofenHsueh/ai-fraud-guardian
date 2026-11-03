import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { canAddEvidence } from '../lib/rules'
import type { EvidenceItem, EvidenceSubmission, GuardianMode } from '../types/evidence'
import type { TransferDraft } from '../types/transfer'
import { GuardianFlowContext, type GuardianFlowValue } from './guardianFlowContext'

const emptyDraft: TransferDraft = { payee: '', amount: null, note: '' }

function releasePreview(item: EvidenceItem) {
  if (item.type === 'image') URL.revokeObjectURL(item.previewUrl)
}

export function GuardianFlowProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<GuardianMode | null>(null)
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [consented, setConsented] = useState(false)
  const [transferDraft, setTransferDraft] = useState<TransferDraft>(emptyDraft)
  const [submission, setSubmission] = useState<EvidenceSubmission | null>(null)

  const clearItems = useCallback(() => {
    items.forEach(releasePreview)
    setItems([])
    setConsented(false)
  }, [items])

  const startGuardian = useCallback(
    (nextMode: GuardianMode) => {
      clearItems()
      setSubmission(null)
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

  const value = useMemo<GuardianFlowValue>(
    () => ({
      mode,
      items,
      consented,
      transferDraft,
      submission,
      startGuardian,
      addItem,
      removeItem,
      clearItems,
      setConsented,
      setTransferDraft,
      setSubmission,
    }),
    [mode, items, consented, transferDraft, submission, startGuardian, addItem, removeItem, clearItems],
  )

  return <GuardianFlowContext.Provider value={value}>{children}</GuardianFlowContext.Provider>
}
