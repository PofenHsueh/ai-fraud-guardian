import { App, Button, Form, Input, InputNumber } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GuardianEntryCard } from '../components/GuardianEntryCard'
import { Page } from '../components/Page'
import { ProactiveAlertModal } from '../components/ProactiveAlertModal'
import { paths } from '../lib/paths'
import { shouldShowProactiveAlert } from '../lib/rules'
import { useGuardianFlow } from '../state/guardianFlowContext'
import type { GuardianMode } from '../types/evidence'

export function TransferPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { transferDraft, setTransferDraft, startGuardian } = useGuardianFlow()
  const [alertOpen, setAlertOpen] = useState(false)
  const { payee, amount, note } = transferDraft
  const canTransfer = payee.trim() !== '' && amount !== null && amount > 0

  const enterGuardian = (mode: GuardianMode) => {
    setAlertOpen(false)
    startGuardian(mode)
    navigate(paths.guardianIntro)
  }

  const completeTransfer = () => {
    setAlertOpen(false)
    setTransferDraft({ payee: '', amount: null, note: '' })
    message.success('轉帳完成（模擬）')
  }

  const confirm = () => {
    if (shouldShowProactiveAlert(amount)) setAlertOpen(true)
    else completeTransfer()
  }

  return (
    <Page
      title="轉帳／匯款"
      footer={
        <Button type="primary" block disabled={!canTransfer} onClick={confirm}>
          確認轉帳
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item label="收款人" htmlFor="transfer-payee">
          <Input
            id="transfer-payee"
            value={payee}
            onChange={(e) => setTransferDraft({ ...transferDraft, payee: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="金額" htmlFor="transfer-amount">
          <InputNumber<number>
            id="transfer-amount"
            style={{ width: '100%' }}
            min={1}
            precision={0}
            inputMode="numeric"
            prefix="NT$"
            value={amount}
            onChange={(value) => setTransferDraft({ ...transferDraft, amount: value })}
          />
        </Form.Item>
        <Form.Item label="備註" htmlFor="transfer-note">
          <Input
            id="transfer-note"
            value={note}
            onChange={(e) => setTransferDraft({ ...transferDraft, note: e.target.value })}
          />
        </Form.Item>
      </Form>
      <GuardianEntryCard onClick={() => enterGuardian('passive')} />
      <ProactiveAlertModal
        open={alertOpen}
        onVerify={() => enterGuardian('active')}
        onSkip={completeTransfer}
        onClose={() => setAlertOpen(false)}
      />
    </Page>
  )
}
