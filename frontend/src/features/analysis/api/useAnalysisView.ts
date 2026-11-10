import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { paths } from '@/config/paths'
import { riskLevels } from '@/features/analysis/config/riskLevels'
import { initialMockParam, isMockScenario, mockOutcome, type MockScenario } from '@/features/analysis/mocks/mockAnalysis'
import {
  ApiHttpError,
  createCase,
  getCaseStatus,
  isApiConfigured,
  startCaseAnalysis,
  uploadCaseFile,
  type AnalyzeEvidencePayload,
  type CreateCaseEvidenceItem,
} from '@/lib/guardianApi'
import { compressImageForUpload } from '@/lib/imageCompressor'
import { useGuardianFlow } from '@/stores/guardian-flow/guardianFlowContext'
import type { AnalysisView, RiskLevel } from '@/types/analysis'
import type { EvidenceSubmission } from '@/types/evidence'

const ANALYZING_MS = 2000
const RETRY_NOTICE_MS = 1000
const RETRY_DONE_MS = 4000
const POLL_INTERVAL_MS = 2500
const POLL_TIMEOUT_MS = 30000
const BACKOFF_429_MS = 3000
const DEFAULT_SCENARIO: MockScenario = 'medium-high'
const ANALYZING: AnalysisView = { phase: 'analyzing', retrying: false }

const isValidRiskLevel = (value: unknown): value is RiskLevel => {
  return typeof value === 'string' && value in riskLevels
}

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

const runRealAnalysisFlow = async (
  submission: EvidenceSubmission,
  onViewChange: (view: AnalysisView) => void,
  onCaseCreated: (caseId: string) => void,
  onUnauthorized: () => void,
  isCancelled: () => boolean,
): Promise<void> => {
  const startedAt = Date.now()

  const callWithRetry = async <T>(fn: () => Promise<T>, timeoutOriginMs = startedAt): Promise<T> => {
    let retried = false
    while (true) {
      if (isCancelled()) throw new Error('Analysis flow cancelled')
      try {
        const result = await fn()
        if (retried && !isCancelled()) {
          onViewChange({ phase: 'analyzing', retrying: false })
        }
        return result
      } catch (err) {
        if (isCancelled()) throw err
        if (err instanceof ApiHttpError) {
          if (err.status === 401) {
            onUnauthorized()
            throw err
          }
          if (err.status === 403) {
            onViewChange({ phase: 'blocked' })
            throw err
          }
          if (err.status === 429 && Date.now() - timeoutOriginMs < POLL_TIMEOUT_MS) {
            retried = true
            onViewChange({ phase: 'analyzing', retrying: true })
            await sleep(BACKOFF_429_MS)
            continue
          }
        }
        onViewChange({ phase: 'failed' })
        throw err
      }
    }
  }

  // 步驟 1：壓縮所有截圖（確保單檔 <= 10 MB）並準備證據索引
  let imageCounter = 0
  const pendingUploads: Array<{ fileName: string; blob: Blob; contentType: string }> = []
  const createEvidenceItems: CreateCaseEvidenceItem[] = []

  try {
    for (const item of submission.items) {
      if (item.type === 'image') {
        imageCounter += 1
        const compressed = await compressImageForUpload(item.file)
        if (isCancelled()) return
        const seq = String(imageCounter).padStart(2, '0')
        const fileName = `${seq}.${compressed.ext}`
        pendingUploads.push({
          fileName,
          blob: compressed.blob,
          contentType: compressed.contentType,
        })
        createEvidenceItems.push({ type: 'image', fileName })
      } else if (item.type === 'url') {
        createEvidenceItems.push({ type: 'url', value: item.value })
      } else {
        createEvidenceItems.push({ type: 'text', value: item.value })
      }
    }
  } catch (err) {
    if (!isCancelled()) onViewChange({ phase: 'failed' })
    throw err
  }

  if (isCancelled()) return

  // 步驟 2：API 1 建立 Case (POST /cases)
  const created = await callWithRetry(() =>
    createCase({
      mode: submission.mode,
      consentedAt: submission.consentedAt,
      evidence: createEvidenceItems,
    }),
  )
  if (isCancelled()) return
  onCaseCreated(created.caseId)

  // 步驟 3：API 2 並行上傳所有截圖至 S3 (PUT /cases/{id}/files/{n})
  if (pendingUploads.length > 0) {
    await Promise.all(
      pendingUploads.map((upload) =>
        callWithRetry(() => uploadCaseFile(created.caseId, upload.fileName, upload.blob, upload.contentType)),
      ),
    )
  }
  if (isCancelled()) return

  // 步驟 4：API 3 啟動 Step Functions 分析 (POST /cases/{id}/analyze - 交接點 A)
  const analyzeEvidence: AnalyzeEvidencePayload[] = createEvidenceItems.map((item) => {
    if (item.type === 'image') {
      return {
        type: 'image',
        fileName: item.fileName,
        s3Key: `evidence/${created.userId}/${created.caseId}/${item.fileName}`,
      }
    }
    return item
  })

  await callWithRetry(() =>
    startCaseAnalysis(created.caseId, {
      mode: submission.mode,
      submittedAt: new Date().toISOString(),
      evidence: analyzeEvidence,
    }),
  )
  if (isCancelled()) return

  // 步驟 5：API 4 每 2.5 秒輪詢 GET /cases/{id}（讀取交接點 C），逾時 30 秒轉為 failed
  const pollStartedAt = Date.now()
  while (!isCancelled() && Date.now() - pollStartedAt < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS)
    if (isCancelled()) return

    const statusResp = await callWithRetry(() => getCaseStatus(created.caseId), pollStartedAt)
    if (isCancelled()) return

    if (statusResp.status === 'COMPLETED' && statusResp.result) {
      const { riskLevel, fraudType, signals, suggestion } = statusResp.result
      if (isValidRiskLevel(riskLevel) && typeof fraudType === 'string' && typeof suggestion === 'string') {
        onViewChange({
          phase: 'result',
          result: {
            riskLevel,
            fraudType,
            signals: Array.isArray(signals) ? signals.filter((s): s is string => typeof s === 'string') : [],
            suggestion,
          },
        })
        return
      }
      onViewChange({ phase: 'failed' })
      return
    }

    if (statusResp.status === 'FAILED') {
      onViewChange({ phase: 'failed' })
      return
    }
  }

  if (!isCancelled()) {
    onViewChange({ phase: 'failed' })
  }
}

// 分析頁取得目前狀態的接點：
// 1. 當設定 VITE_API_BASE_URL 且未指定 ?mock= 時，執行真實 API 1~4 串接與輪詢。
// 2. 未設定 VITE_API_BASE_URL 或網址帶 ?mock= 時，使用本地示範用假資料。
export const useAnalysisView = (): AnalysisView => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { submission, setCaseId } = useGuardianFlow()
  const explicitMock = searchParams.get('mock') ?? initialMockParam
  const useRealApi = isApiConfigured() && explicitMock === null
  const scenario = isMockScenario(explicitMock) ? explicitMock : DEFAULT_SCENARIO

  const [state, setState] = useState<{ key: string; view: AnalysisView }>({
    key: useRealApi ? 'api' : scenario,
    view: ANALYZING,
  })
  const currentKey = useRealApi ? 'api' : scenario
  const view = state.key === currentKey ? state.view : ANALYZING

  useEffect(() => {
    if (useRealApi) {
      if (!submission) return
      let cancelled = false
      const show = (next: AnalysisView) => {
        if (!cancelled) setState({ key: 'api', view: next })
      }

      runRealAnalysisFlow(
        submission,
        show,
        (id) => {
          if (!cancelled) setCaseId(id)
        },
        () => {
          if (!cancelled) navigate(paths.login)
        },
        () => cancelled,
      ).catch(() => {
        // 錯誤已於 runRealAnalysisFlow 內部轉為對應 phase
      })

      return () => {
        cancelled = true
      }
    }

    const show = (next: AnalysisView) => setState({ key: scenario, view: next })
    const timers = [
      window.setTimeout(() => show(mockOutcome(scenario)), scenario === 'retrying' ? RETRY_DONE_MS : ANALYZING_MS),
    ]
    if (scenario === 'retrying') {
      timers.push(window.setTimeout(() => show({ phase: 'analyzing', retrying: true }), RETRY_NOTICE_MS))
    }
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [useRealApi, submission, scenario, setCaseId, navigate])

  return view
}
