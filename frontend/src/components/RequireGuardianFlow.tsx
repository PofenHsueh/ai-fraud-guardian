import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { paths } from '../lib/paths'
import { useGuardianFlow } from '../state/guardianFlowContext'

// 流程狀態不保存，重新整理或直接開啟守門員頁面時回到轉帳頁重新開始
export function RequireGuardianFlow({ children }: { children: ReactNode }) {
  const { mode } = useGuardianFlow()
  return mode ? children : <Navigate to={paths.transfer} replace />
}
