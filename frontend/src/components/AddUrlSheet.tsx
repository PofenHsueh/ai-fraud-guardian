import { Button, Form, Input } from 'antd'
import { useState } from 'react'
import { isValidUrlInput } from '../lib/rules'
import { BottomSheet } from './BottomSheet'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (value: string) => void
}

export function AddUrlSheet({ open, onClose, onAdd }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setValue('')
    setError(null)
    onClose()
  }

  const submit = () => {
    if (!isValidUrlInput(value)) {
      setError('網址格式不正確，請確認沒有空白並包含網域（例如 example.com）')
      return
    }
    onAdd(value)
    close()
  }

  return (
    <BottomSheet
      open={open}
      title="貼上可疑網址"
      onClose={close}
      primaryAction={
        <Button type="primary" block disabled={value.trim() === ''} onClick={submit}>
          新增
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item
          label="網址"
          htmlFor="evidence-url"
          validateStatus={error ? 'error' : undefined}
          help={error ?? undefined}
        >
          <Input
            id="evidence-url"
            placeholder="貼上網站或連結網址"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(null)
            }}
          />
        </Form.Item>
      </Form>
    </BottomSheet>
  )
}
