import { Navigate, Route, Routes } from 'react-router'
import { RequireGuardianFlow } from './components/RequireGuardianFlow'
import { paths } from './lib/paths'
import { GuardianAnalysisPage } from './pages/GuardianAnalysisPage'
import { GuardianEvidencePage } from './pages/GuardianEvidencePage'
import { GuardianIntroPage } from './pages/GuardianIntroPage'
import { LoginPage } from './pages/LoginPage'
import { TransferPage } from './pages/TransferPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.transfer} element={<TransferPage />} />
      <Route path={paths.guardianIntro} element={<RequireGuardianFlow><GuardianIntroPage /></RequireGuardianFlow>} />
      <Route path={paths.guardianEvidence} element={<RequireGuardianFlow><GuardianEvidencePage /></RequireGuardianFlow>} />
      <Route path={paths.guardianAnalysis} element={<RequireGuardianFlow><GuardianAnalysisPage /></RequireGuardianFlow>} />
      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  )
}
