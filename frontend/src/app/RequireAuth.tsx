import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { paths } from '@/config/paths'
import { isSignedIn } from '@/lib/cognitoAuth'

// 有設定 Cognito 時，未登入（沒有 ID Token）一律導回登入頁；示範模式不檢查
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  return isSignedIn() ? children : <Navigate to={paths.login} replace />
}
