import { Button, Flex, Modal, Typography } from 'antd'
import { MOBILE_MODAL_WIDTH } from '../theme'

type Props = {
  open: boolean
  onVerify: () => void
  onSkip: () => void
  onClose: () => void
}

export const ProactiveAlertModal = ({ open, onVerify, onSkip, onClose }: Props) => {
  return (
    <Modal open={open} title="這筆轉帳請先停一下" onCancel={onClose} footer={null} centered width={MOBILE_MODAL_WIDTH}>
      <Typography.Paragraph>
        這筆轉帳金額較高。如果有人要求您轉帳，建議先讓防詐安全守門員幫您查證。
      </Typography.Paragraph>
      <Flex vertical gap={8}>
        <Button type="primary" block onClick={onVerify}>
          先查證
        </Button>
        <Button block onClick={onSkip}>
          略過，繼續轉帳
        </Button>
      </Flex>
    </Modal>
  )
}
