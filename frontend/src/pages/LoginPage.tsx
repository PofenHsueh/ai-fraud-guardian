import { App, Button, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Page } from '../components/Page'
import { isCognitoConfigured, signInWithCognito } from '../lib/cognitoAuth'
import { paths } from '../lib/paths'

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
    <Page title="CUBE 登入">
      <Typography.Paragraph type="secondary">
        {useCognito ? '請輸入 Cognito 測試帳號與密碼登入。' : '此為示範頁面，不會驗證帳號密碼。'}
      </Typography.Paragraph>
      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item label="身分證字號／會員帳號" htmlFor="login-account">
          <Input id="login-account" autoComplete="off" value={account} onChange={(e) => setAccount(e.target.value)} />
        </Form.Item>
        <Form.Item label="密碼" htmlFor="login-password">
          <Input.Password
            id="login-password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={submitting} disabled={!canLogin}>
          登入
        </Button>
      </Form>
    </Page>
  )
}
