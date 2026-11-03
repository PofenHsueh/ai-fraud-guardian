import { useNavigate } from 'react-router'
import { AnalyzingView } from '../components/analysis/AnalyzingView'
import { BlockedView } from '../components/analysis/BlockedView'
import { FallbackView } from '../components/analysis/FallbackView'
import { ResultView } from '../components/analysis/ResultView'
import { bankService, fraudHotline } from '../lib/contacts'
import { paths } from '../lib/paths'
import { useAnalysisView } from '../state/useAnalysisView'
import { useDecide } from '../state/useDecide'

const contacts = [fraudHotline, bankService]

export const GuardianAnalysisPage = () => {
  const navigate = useNavigate()
  const view = useAnalysisView()
  const decide = useDecide()

  switch (view.phase) {
    case 'analyzing':
      return <AnalyzingView retrying={view.retrying} />
    case 'result':
      return <ResultView result={view.result} onDecide={decide} />
    case 'failed':
      return <FallbackView contacts={contacts} onDecide={decide} />
    case 'blocked':
      return (
        <BlockedView
          onBackToEvidence={() => navigate(paths.guardianEvidence)}
          onBackToTransfer={() => navigate(paths.transfer)}
        />
      )
  }
}
