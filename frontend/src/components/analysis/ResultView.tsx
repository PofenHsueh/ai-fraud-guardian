import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Tag, Typography } from 'antd'
import { riskLevels } from '../../lib/riskLevels'
import type { AnalysisResult, Decision } from '../../types/analysis'
import { Page } from '../Page'
import styles from './ResultView.module.css'

type Props = {
  result: AnalysisResult
  onDecide: (decision: Decision) => void
}

// AI 回傳內容一律以 React 文字節點輸出，不解析 HTML、網址不做成連結
export const ResultView = ({ result, onDecide }: Props) => {
  const level = riskLevels[result.riskLevel]

  return (
    <Page
      title="查證結果"
      footer={
        <Flex vertical gap={8}>
          <Button type="primary" block onClick={() => onDecide(level.primary.decision)}>
            {level.primary.label}
          </Button>
          <Button block onClick={() => onDecide(level.secondary.decision)}>
            {level.secondary.label}
          </Button>
        </Flex>
      }
    >
      <section className={styles.risk}>
        <Tag color={level.color} className={styles.level}>
          {level.label}
        </Tag>
        <Typography.Text className={styles.fraudType}>{result.fraudType}</Typography.Text>
      </section>

      <Typography.Title level={5}>辨識到的風險訊號</Typography.Title>
      {result.signals.length === 0 ? (
        <Typography.Paragraph type="secondary">未辨識到明顯的風險訊號</Typography.Paragraph>
      ) : (
        <ul className={styles.signals}>
          {result.signals.map((signal, i) => (
            <li key={i} className={styles.signal}>
              <ExclamationCircleOutlined className={styles.signalIcon} />
              <Typography.Text>{signal}</Typography.Text>
            </li>
          ))}
        </ul>
      )}

      <Typography.Title level={5}>建議</Typography.Title>
      <Typography.Paragraph>{result.suggestion}</Typography.Paragraph>
    </Page>
  )
}
