import { Result } from 'antd'
import { Page } from '../components/Page'
import { useGuardianFlow } from '../state/guardianFlowContext'

// 佔位頁：查證中與結果畫面由 add-analysis-result-ui 實作
export function GuardianAnalysisPage() {
  const { submission } = useGuardianFlow()

  return (
    <Page title="分析流程">
      <Result
        status="info"
        title="已收到您的查證資料"
        subTitle={
          submission
            ? `共 ${submission.items.length} 筆，${submission.mode === 'active' ? '主動提醒' : '自行查證'}`
            : '尚未送出資料'
        }
      />
    </Page>
  )
}
