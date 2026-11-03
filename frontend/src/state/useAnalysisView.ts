import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { initialMockParam, isMockScenario, mockOutcome, type MockScenario } from '../lib/mockAnalysis'
import type { AnalysisView } from '../types/analysis'

const ANALYZING_MS = 2000
const RETRY_NOTICE_MS = 1000
const RETRY_DONE_MS = 4000
const DEFAULT_SCENARIO: MockScenario = 'medium-high'
const ANALYZING: AnalysisView = { phase: 'analyzing', retrying: false }

// 分析頁取得目前狀態的接點。目前依 ?mock= 情境回傳假資料；
// 串接層（③）在這裡換成輪詢 GET /cases/{id}，並把 403／429／逾時轉成對應的 phase。
export const useAnalysisView = (): AnalysisView => {
  const [searchParams] = useSearchParams()
  const param = searchParams.get('mock') ?? initialMockParam
  const scenario = isMockScenario(param) ? param : DEFAULT_SCENARIO
  // 狀態記錄所屬情境，情境改變時直接回到查證中，不需在 effect 裡重設
  const [state, setState] = useState<{ scenario: MockScenario; view: AnalysisView }>({ scenario, view: ANALYZING })
  const view = state.scenario === scenario ? state.view : ANALYZING

  useEffect(() => {
    const show = (next: AnalysisView) => setState({ scenario, view: next })
    const timers = [window.setTimeout(() => show(mockOutcome(scenario)), scenario === 'retrying' ? RETRY_DONE_MS : ANALYZING_MS)]
    if (scenario === 'retrying') {
      timers.push(window.setTimeout(() => show({ phase: 'analyzing', retrying: true }), RETRY_NOTICE_MS))
    }
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [scenario])

  return view
}
