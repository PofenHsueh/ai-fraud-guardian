import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { initialMockParam } from '@/features/analysis/mocks/mockAnalysis'
import { isApiConfigured, reportCaseDecision } from '@/lib/guardianApi'
import { useGuardianFlow } from '@/stores/guardian-flow/guardianFlowContext'
import type { Decision } from '@/types/analysis'

// 回報決策的接點（角色 ③）：
// 已設定 VITE_API_BASE_URL、未指定 ?mock= 且有 caseId 時呼叫 POST /cases/{id}/decision；否則僅記錄於本機狀態。
export const useReportDecision = () => {
  const [searchParams] = useSearchParams()
  const { caseId, setDecision } = useGuardianFlow()
  const explicitMock = searchParams.get('mock') ?? initialMockParam
  const useRealApi = isApiConfigured() && explicitMock === null

  return useCallback(
    (decision: Decision) => {
      setDecision(decision)
      if (useRealApi && caseId) {
        reportCaseDecision(caseId, decision).catch((err) => {
          console.warn('[API] 回報決策失敗：', err)
        })
      } else {
        console.info('[示範] 回報決策：', decision)
      }
    },
    [useRealApi, caseId, setDecision],
  )
}
