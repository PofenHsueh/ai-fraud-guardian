import { App, Button, Checkbox, Flex, Typography } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AccountBar } from '@/app/AccountBar'
import { Page } from '@/components/layouts/Page'
import { MAX_EVIDENCE_ITEMS } from '@/config/limits'
import { paths } from '@/config/paths'
import { useSubmitEvidence } from '@/features/evidence/api/useSubmitEvidence'
import { AddImageSheet } from '@/features/evidence/components/AddImageSheet'
import { AddTextSheet } from '@/features/evidence/components/AddTextSheet'
import { AddUrlSheet } from '@/features/evidence/components/AddUrlSheet'
import { EvidenceList } from '@/features/evidence/components/EvidenceList'
import { createImageEvidence, createTextEvidence, createUrlEvidence } from '@/features/evidence/utils/evidenceFactory'
import { canAddEvidence, canStartAnalysis } from '@/features/evidence/utils/rules'
import { useGuardianFlow } from '@/stores/guardian-flow/guardianFlowContext'

type Sheet = 'image' | 'url' | 'text' | null

export const GuardianEvidencePage = () => {
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
      title="防詐安全守門員"
      headerExtra={<AccountBar />}
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
