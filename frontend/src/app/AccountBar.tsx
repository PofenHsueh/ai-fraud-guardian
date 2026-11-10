import { LogoutOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import { startTransition } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/config/paths'
import { clearAuthTokens, getSignedInName } from '@/lib/cognitoAuth'
import { useGuardianFlow } from '@/stores/guardian-flow/guardianFlowContext'
import styles from './AccountBar.module.css'

// 頁首右側：使用者名稱與登出。未接 Cognito 時顯示示範使用者
export const AccountBar = () => {
  const navigate = useNavigate()
  const { modal } = App.useApp()
  const { resetFlow } = useGuardianFlow()
  const name = getSignedInName() ?? '示範使用者'

  const logout = () => {
    modal.confirm({
      title: '確定要登出嗎？',
      content: '登出後，這次填寫的轉帳資料與查證內容都會清除。',
      okText: '登出',
      cancelText: '取消',
      onOk: () => {
        clearAuthTokens()
        navigate(paths.login, { replace: true })
        // react-router 以 transition 換頁；清除流程狀態也放進 transition，
        // 避免守門員頁面的進入檢查先看到流程結束而導回轉帳頁
        startTransition(resetFlow)
      },
    })
  }

  return (
    <span className={styles.account}>
      <span className={styles.name}>{name}</span>
      <Button type="text" icon={<LogoutOutlined />} onClick={logout}>
        登出
      </Button>
    </span>
  )
}
