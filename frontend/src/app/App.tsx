import { App as AntApp, ConfigProvider } from 'antd'
import zhTW from 'antd/locale/zh_TW'
import { MobileLayout } from '@/components/layouts/MobileLayout'
import { theme } from '@/config/theme'
import { GuardianFlowProvider } from '@/stores/guardian-flow/GuardianFlowProvider'
import { AppRoutes } from './AppRoutes'

// 路由器由外層（main.tsx）提供
const App = () => {
  return (
    <ConfigProvider locale={zhTW} theme={theme} variant="filled">
      <AntApp>
        <GuardianFlowProvider>
          <MobileLayout>
            <AppRoutes />
          </MobileLayout>
        </GuardianFlowProvider>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
