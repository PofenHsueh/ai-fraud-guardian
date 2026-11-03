import { PictureOutlined } from '@ant-design/icons'
import { App, Button, Typography, Upload } from 'antd'
import { BottomSheet } from './BottomSheet'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (file: File) => void
}

export function AddImageSheet({ open, onClose, onAdd }: Props) {
  const { message } = App.useApp()

  return (
    <BottomSheet
      open={open}
      title="新增截圖"
      onClose={onClose}
      primaryAction={
        <Upload
          accept="image/*"
          showUploadList={false}
          // 回傳 false 讓 antd 不自動送出請求，檔案交給上層處理
          beforeUpload={(file) => {
            if (file.type.startsWith('image/')) onAdd(file)
            else message.error('只能上傳圖片檔')
            return false
          }}
          style={{ display: 'block' }}
        >
          <Button type="primary" block icon={<PictureOutlined />}>
            上傳照片
          </Button>
        </Upload>
      }
    >
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        選擇對話、群組或轉帳要求的截圖
      </Typography.Paragraph>
    </BottomSheet>
  )
}
