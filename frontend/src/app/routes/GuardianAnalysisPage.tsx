import { useNavigate } from 'react-router'
import { paths } from '@/config/paths'
import { useAnalysisView } from '@/features/analysis/api/useAnalysisView'
import { AnalyzingView } from '@/features/analysis/components/AnalyzingView'
import { BlockedView } from '@/features/analysis/components/BlockedView'
import { FallbackView } from '@/features/analysis/components/FallbackView'
import { ResultView } from '@/features/analysis/components/ResultView'
import { bankService, fraudHotline } from '@/features/analysis/config/contacts'
import { useDecide } from '@/features/analysis/hooks/useDecide'

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
