import { App } from 'antd'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '../lib/paths'
import type { Decision } from '../types/analysis'
import { useGuardianFlow } from './guardianFlowContext'
import { useReportDecision } from './useReportDecision'

// 結果畫面與備援畫面的決策：交出決策、清理流程狀態並回到轉帳頁
export const useDecide = () => {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { finishGuardian } = useGuardianFlow()
  const reportDecision = useReportDecision()

  return useCallback(
    (decision: Decision) => {
      reportDecision(decision)
      const transferCompleted = finishGuardian(decision)
      navigate(paths.transfer)
      if (transferCompleted) message.success('轉帳完成（模擬）')
    },
    [reportDecision, finishGuardian, navigate, message],
  )
}
