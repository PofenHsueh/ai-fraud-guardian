import { useCallback } from 'react'
import type { Decision } from '../types/analysis'
import { useGuardianFlow } from './guardianFlowContext'

// 回報決策的接點。目前只把決策存進流程狀態並輸出到 console，方便示範時確認；
// 串接層（③）在這裡換成呼叫 POST /cases/{id}/decision。
export const useReportDecision = () => {
  const { setDecision } = useGuardianFlow()

  return useCallback(
    (decision: Decision) => {
      setDecision(decision)
      console.info('[示範] 回報決策：', decision)
    },
    [setDecision],
  )
}
