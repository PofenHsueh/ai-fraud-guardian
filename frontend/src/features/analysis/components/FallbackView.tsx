import { PhoneOutlined } from '@ant-design/icons'
import { Button, Flex, Result, Typography } from 'antd'
import { Page } from '@/components/layouts/Page'
import type { Contact } from '@/features/analysis/config/contacts'
import type { Decision } from '@/types/analysis'

type Props = {
  contacts: Contact[]
  onDecide: (decision: Decision) => void
}

// 撥號連結是系統提供的固定資訊，不受「網址不可點擊」限制
const ContactRow = ({ contact }: { contact: Contact }) => {
  if (!contact.tel) {
    return (
      <Button block disabled icon={<PhoneOutlined />}>
        {contact.label}（號碼待確認）
      </Button>
    )
  }
  return (
    <Button block href={`tel:${contact.tel}`} icon={<PhoneOutlined />}>
      {contact.label}
    </Button>
  )
}

export const FallbackView = ({ contacts, onDecide }: Props) => {
  return (
    <Page
      title="防詐安全守門員"
      footer={
        <Flex vertical gap={8}>
          <Button type="primary" block onClick={() => onDecide('paused')}>
            暫停並離開
          </Button>
          <Button block onClick={() => onDecide('continued')}>
            仍要繼續轉帳
          </Button>
        </Flex>
      }
    >
      <Result status="warning" title="暫時無法完成查證" subTitle="轉帳前若有疑慮，請先撥打下列電話查證。" />
      <Flex vertical gap={8}>
        {contacts.map((contact) => (
          <ContactRow key={contact.label} contact={contact} />
        ))}
      </Flex>
      <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
        詐騙集團常要求「立刻轉帳」，多花幾分鐘查證不會有損失。
      </Typography.Paragraph>
    </Page>
  )
}
