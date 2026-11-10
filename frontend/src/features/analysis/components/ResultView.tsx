import { Button, ConfigProvider, Flex, Typography } from 'antd'
import { Page } from '@/components/layouts/Page'
import { riskLevels } from '@/features/analysis/config/riskLevels'
import type { AnalysisResult, Decision } from '@/types/analysis'
import styles from './ResultView.module.css'

type Props = {
  result: AnalysisResult
  onDecide: (decision: Decision) => void
}

// AI 回傳內容一律以 React 文字節點輸出，不解析 HTML、網址不做成連結
export const ResultView = ({ result, onDecide }: Props) => {
  const level = riskLevels[result.riskLevel]
  const { main, tint } = level.tone

  return (
    <Page
      title="防詐安全守門員"
      footer={
        <Flex vertical gap={8}>
          {/* 主要按鈕依風險等級變色 */}
          <ConfigProvider theme={{ token: { colorPrimary: main } }}>
            <Button type="primary" block onClick={() => onDecide(level.primary.decision)}>
              {level.primary.label}
            </Button>
          </ConfigProvider>
          <Button block onClick={() => onDecide(level.secondary.decision)}>
            {level.secondary.label}
          </Button>
        </Flex>
      }
    >
      <section className={styles.risk} style={{ color: main, borderColor: main, background: tint }}>
        {level.label}・{result.fraudType}
      </section>

      <Typography.Title level={5}>辨識到的風險訊號</Typography.Title>
      {result.signals.length === 0 ? (
        <Typography.Paragraph type="secondary">未辨識到明顯的風險訊號</Typography.Paragraph>
      ) : (
        <ul className={styles.signals}>
          {result.signals.map((signal, i) => (
            <li key={i} className={styles.signal}>
              <span className={styles.dot} style={{ background: main }} aria-hidden="true" />
              <Typography.Text>{signal}</Typography.Text>
            </li>
          ))}
        </ul>
      )}

      <Typography.Paragraph className={styles.suggestion}>建議：{result.suggestion}</Typography.Paragraph>
    </Page>
  )
}
