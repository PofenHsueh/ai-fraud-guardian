import { FileTextOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { Page } from '../components/Page'
import { paths } from '../lib/paths'

const evidenceTypes = [
  { icon: <PictureOutlined />, title: '截圖', description: '對話紀錄、投資群組、轉帳要求等畫面' },
  { icon: <LinkOutlined />, title: '網址', description: '對方傳來的網站或連結' },
  { icon: <FileTextOutlined />, title: '文字摘要', description: '用自己的話描述對方說了什麼' },
]

export const GuardianIntroPage = () => {
  const navigate = useNavigate()

  return (
    <Page
      title="防詐安全守門員"
      onBack={() => navigate(paths.transfer)}
      footer={
        <Button type="primary" block onClick={() => navigate(paths.guardianEvidence)}>
          繼續
        </Button>
      }
    >
      <Typography.Title level={2}>把可疑內容傳給我們</Typography.Title>
      <Typography.Paragraph>轉帳前不確定對方是不是詐騙？提供以下任一種資料，AI 會幫您查證。</Typography.Paragraph>
      <Flex vertical gap={12} style={{ marginBottom: 16 }}>
        {evidenceTypes.map((item) => (
          <Flex key={item.title} gap={12} align="start">
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <Typography.Text strong>{item.title}</Typography.Text>
              <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                {item.description}
              </Typography.Paragraph>
            </div>
          </Flex>
        ))}
      </Flex>
      <Alert type="info" showIcon title="系統不會自動讀取手機內容，只會分析您主動提供的資料。" />
    </Page>
  )
}
