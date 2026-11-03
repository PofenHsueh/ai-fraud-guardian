import { Button, Flex, Result } from 'antd'
import { Page } from '../Page'

type Props = {
  onBackToEvidence: () => void
  onBackToTransfer: () => void
}

// 請求已被拒絕，決策也送不出去，所以不提供決策按鈕
export const BlockedView = ({ onBackToEvidence, onBackToTransfer }: Props) => {
  return (
    <Page
      title="查證結果"
      footer={
        <Flex vertical gap={8}>
          <Button type="primary" block onClick={onBackToEvidence}>
            返回上傳清單
          </Button>
          <Button block onClick={onBackToTransfer}>
            回到轉帳頁
          </Button>
        </Flex>
      }
    >
      <Result status="error" title="系統暫時無法處理，請稍後再試" subTitle="已新增的資料都還在，稍後可以直接重新送出。" />
    </Page>
  )
}
