import { Navigate, Route, Routes } from 'react-router'
import { GuardianAnalysisPage } from '@/app/routes/GuardianAnalysisPage'
import { GuardianEvidencePage } from '@/app/routes/GuardianEvidencePage'
import { GuardianIntroPage } from '@/app/routes/GuardianIntroPage'
import { LoginPage } from '@/app/routes/LoginPage'
import { TransferPage } from '@/app/routes/TransferPage'
import { paths } from '@/config/paths'
import { RequireAuth } from './RequireAuth'
import { RequireGuardianFlow } from './RequireGuardianFlow'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.transfer} element={<RequireAuth><TransferPage /></RequireAuth>} />
      <Route path={paths.guardianIntro} element={<RequireAuth><RequireGuardianFlow><GuardianIntroPage /></RequireGuardianFlow></RequireAuth>} />
      <Route path={paths.guardianEvidence} element={<RequireAuth><RequireGuardianFlow><GuardianEvidencePage /></RequireGuardianFlow></RequireAuth>} />
      <Route path={paths.guardianAnalysis} element={<RequireAuth><RequireGuardianFlow><GuardianAnalysisPage /></RequireGuardianFlow></RequireAuth>} />
      <Route path="*" element={<Navigate to={paths.login} replace />} />
    </Routes>
  )
}
