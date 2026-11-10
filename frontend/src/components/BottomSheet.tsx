import { Button, Drawer, Flex } from 'antd'
import type { ReactNode } from 'react'
import { MOBILE_MAX_WIDTH } from '@/config/theme'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  // 主要動作按鈕（例如「新增」），取消按鈕由本元件提供
  primaryAction?: ReactNode
}

// 從畫面底部彈出的新增視窗，取消或點遮罩即關閉
// Drawer 掛在 body 下不受版型限制，所以限制最大寬度並置中，遮罩維持全螢幕
export const BottomSheet = ({ open, title, onClose, children, primaryAction }: Props) => {
  return (
    <Drawer
      open={open}
      title={title}
      placement="bottom"
      size="auto"
      closable={false}
      onClose={onClose}
      destroyOnHidden
      styles={{
        wrapper: { maxWidth: MOBILE_MAX_WIDTH, margin: '0 auto' },
        section: { borderRadius: '16px 16px 0 0' },
      }}
      footer={
        <Flex vertical gap={8}>
          {primaryAction}
          <Button block onClick={onClose}>
            取消
          </Button>
        </Flex>
      }
    >
      {children}
    </Drawer>
  )
}
