import { Button, Form, Input } from 'antd'
import { useState } from 'react'
import { BottomSheet } from '@/components/BottomSheet'
import { MAX_TEXT_LENGTH } from '@/config/limits'
import { isValidTextInput } from '@/features/evidence/utils/rules'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (value: string) => void
}

export const AddTextSheet = ({ open, onClose, onAdd }: Props) => {
  const [value, setValue] = useState('')
  const atLimit = value.length >= MAX_TEXT_LENGTH

  const close = () => {
    setValue('')
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      title="輸入文字摘要"
      onClose={close}
      primaryAction={
        <Button
          type="primary"
          block
          disabled={!isValidTextInput(value)}
          onClick={() => {
            onAdd(value)
            close()
          }}
        >
          新增
        </Button>
      }
    >
      <Form layout="vertical">
        <Form.Item
          label="文字摘要"
          htmlFor="evidence-text"
          help={atLimit ? `已達 ${MAX_TEXT_LENGTH.toLocaleString()} 字上限` : undefined}
        >
          <Input.TextArea
            id="evidence-text"
            rows={5}
            maxLength={MAX_TEXT_LENGTH}
            showCount
            placeholder="例：對方自稱投資顧問，保證每月穩賺 10%…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Form.Item>
      </Form>
    </BottomSheet>
  )
}
