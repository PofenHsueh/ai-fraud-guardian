import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/config/paths'
import { useGuardianFlow } from '@/stores/guardian-flow/guardianFlowContext'
import type { EvidenceSubmission } from '@/types/evidence'

// 「開始分析」的送出點。目前只把資料交給分析流程頁面；
// 串接層（③）在這裡換成壓縮、上傳與呼叫 API。
export const useSubmitEvidence = () => {
  const navigate = useNavigate()
  const { setSubmission } = useGuardianFlow()

  return useCallback(
    (submission: EvidenceSubmission) => {
      setSubmission(submission)
      navigate(paths.guardianAnalysis)
    },
    [navigate, setSubmission],
  )
}
