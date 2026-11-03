import { App, Button, Checkbox, Flex, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AddImageSheet } from '../components/AddImageSheet'
import { AddTextSheet } from '../components/AddTextSheet'
import { AddUrlSheet } from '../components/AddUrlSheet'
import { EvidenceList } from '../components/EvidenceList'
import { Page } from '../components/Page'
import { createImageEvidence, createTextEvidence, createUrlEvidence } from '../lib/evidenceFactory'
import { paths } from '../lib/paths'
import { MAX_EVIDENCE_ITEMS, canAddEvidence, canStartAnalysis } from '../lib/rules'
import { useGuardianFlow } from '../state/guardianFlowContext'
import { useSubmitEvidence } from '../state/useSubmitEvidence'

type Sheet = 'image' | 'url' | 'text' | null

export function GuardianEvidencePage() {
  const navigate = useNavigate()
  const { modal } = App.useApp()
  const { mode, items, consented, addItem, removeItem, clearItems, setConsented } = useGuardianFlow()
  const submitEvidence = useSubmitEvidence()
  const [sheet, setSheet] = useState<Sheet>(null)
  const canAdd = canAddEvidence(items.length)
  const closeSheet = () => setSheet(null)

  const leave = () => {
    if (items.length === 0) {
      navigate(paths.guardianIntro)
      return
    }
    modal.confirm({
      title: '要放棄已新增的內容嗎？',
      content: '離開後，已新增的截圖、網址與文字都會清除。',
      okText: '放棄',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        clearItems()
        navigate(paths.guardianIntro)
      },
    })
  }

  const start = () => {
    if (!mode) return
    submitEvidence({ mode, items, consentedAt: new Date().toISOString() })
  }

  return (
    <Page
      title="上傳查證資料"
      onBack={leave}
      footer={
        <Flex vertical gap={12}>
          <Checkbox checked={consented} onChange={(e) => setConsented(e.target.checked)}>
            我同意提供以上內容供查證分析，系統不會自動讀取手機內容
          </Checkbox>
          <Button type="primary" block disabled={!canStartAnalysis(items.length, consented)} onClick={start}>
            開始分析
          </Button>
        </Flex>
      }
    >
      <EvidenceList items={items} onRemove={removeItem} />
      <Flex gap={8} style={{ marginTop: 16 }}>
        <Button block disabled={!canAdd} onClick={() => setSheet('image')}>
          ＋ 截圖
        </Button>
        <Button block disabled={!canAdd} onClick={() => setSheet('url')}>
          ＋ 網址
        </Button>
        <Button block disabled={!canAdd} onClick={() => setSheet('text')}>
          ＋ 文字
        </Button>
      </Flex>
      {!canAdd && (
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          已達 {MAX_EVIDENCE_ITEMS} 筆上限，如需新增請先刪除部分內容。
        </Typography.Paragraph>
      )}

      <AddImageSheet
        open={sheet === 'image'}
        onClose={closeSheet}
        onAdd={(file) => {
          addItem(createImageEvidence(file))
          closeSheet()
        }}
      />
      <AddUrlSheet open={sheet === 'url'} onClose={closeSheet} onAdd={(v) => addItem(createUrlEvidence(v))} />
      <AddTextSheet open={sheet === 'text'} onClose={closeSheet} onAdd={(v) => addItem(createTextEvidence(v))} />
    </Page>
  )
}
