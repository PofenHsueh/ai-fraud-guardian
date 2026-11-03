import { Button, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Page } from '../components/Page'
import { paths } from '../lib/paths'

// 示範用登入頁：不驗證、不送出、不保存輸入內容
export const LoginPage = () => {
  const navigate = useNavigate()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const canLogin = account.trim() !== '' && password !== ''

  return (
    <Page title="CUBE 登入">
      <Typography.Paragraph type="secondary">此為示範頁面，不會驗證帳號密碼。</Typography.Paragraph>
      <Form layout="vertical" onFinish={() => navigate(paths.transfer)}>
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
        <Button type="primary" htmlType="submit" block disabled={!canLogin}>
          登入
        </Button>
      </Form>
    </Page>
  )
}
