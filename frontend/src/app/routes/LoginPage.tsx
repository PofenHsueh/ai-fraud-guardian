import { App, Button, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/config/paths'
import { BRAND_COLOR, BRAND_TINT } from '@/config/theme'
import { isCognitoConfigured, signInWithCognito } from '@/lib/cognitoAuth'
import styles from './LoginPage.module.css'

// 當設定 VITE_COGNITO_CLIENT_ID 時呼叫 AWS Cognito 進行驗證；未設定時維持示範頁直接登入
export const LoginPage = () => {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const canLogin = account.trim() !== '' && password !== '' && !submitting
  const useCognito = isCognitoConfigured()

  const handleFinish = async () => {
    if (!useCognito) {
      navigate(paths.transfer)
      return
    }
    setSubmitting(true)
    try {
      await signInWithCognito(account, password)
      navigate(paths.transfer)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登入失敗，請稍後再試'
      message.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={styles.login}>
      <div className={styles.logo} style={{ color: BRAND_COLOR, background: BRAND_TINT }}>
        CUBE
      </div>
      <h1 className={styles.appName}>CUBE App</h1>
      <Typography.Text type="secondary">歡迎回來，請登入</Typography.Text>
      <Form className={styles.form} onFinish={handleFinish}>
        <Form.Item>
          <Input
            id="login-account"
            aria-label="身分證字號／會員帳號"
            placeholder="身分證字號／會員帳號"
            autoComplete="off"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input.Password
            id="login-password"
            aria-label="密碼"
            placeholder="密碼"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={submitting} disabled={!canLogin}>
          登入
        </Button>
      </Form>
      <Typography.Text type="secondary" className={styles.note}>
        {useCognito ? '請輸入 Cognito 測試帳號與密碼登入。' : '此為示範頁面，不會驗證帳號密碼。'}
      </Typography.Text>
    </main>
  )
}
