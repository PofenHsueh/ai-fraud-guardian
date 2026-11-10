import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { paths } from '@/config/paths'
import { useGuardianFlow } from '@/stores/guardian-flow/guardianFlowContext'

// 流程狀態不保存，重新整理或直接開啟守門員頁面時回到轉帳頁重新開始
export const RequireGuardianFlow = ({ children }: { children: ReactNode }) => {
  const { mode } = useGuardianFlow()
  return mode ? children : <Navigate to={paths.transfer} replace />
}
