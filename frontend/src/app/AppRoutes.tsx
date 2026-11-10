import { Navigate, Route, Routes } from 'react-router'
import { GuardianAnalysisPage } from '@/app/routes/GuardianAnalysisPage'
import { GuardianEvidencePage } from '@/app/routes/GuardianEvidencePage'
import { GuardianIntroPage } from '@/app/routes/GuardianIntroPage'
import { LoginPage } from '@/app/routes/LoginPage'
import { TransferPage } from '@/app/routes/TransferPage'
import { paths } from '@/config/paths'
import { RequireGuardianFlow } from './RequireGuardianFlow'

export const AppRoutes = () => {
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
