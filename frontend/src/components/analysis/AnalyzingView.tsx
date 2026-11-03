import { Flex, Spin, Typography } from 'antd'
import { Page } from '../Page'

type Props = { retrying: boolean }

// 查證中不提供返回，避免留下進行中的案件
export const AnalyzingView = ({ retrying }: Props) => {
  return (
    <Page title="AI 查證中">
      <Flex vertical align="center" gap={16} style={{ paddingTop: 64, textAlign: 'center' }}>
        <Spin size="large" />
        <Typography.Title level={4} style={{ margin: 0 }}>
          AI 正在為您查證
        </Typography.Title>
        <Typography.Text type="secondary">比對防詐知識庫與外部情資中，預計數秒內完成</Typography.Text>
        {retrying && <Typography.Text type="warning">目前使用人數較多，正在重新嘗試…</Typography.Text>}
      </Flex>
    </Page>
  )
}
