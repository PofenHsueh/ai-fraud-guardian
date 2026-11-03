import { App as AntApp, ConfigProvider } from 'antd'
import zhTW from 'antd/locale/zh_TW'
import { AppRoutes } from './AppRoutes'
import { MobileLayout } from './components/MobileLayout'
import { GuardianFlowProvider } from './state/GuardianFlowProvider'
import { theme } from './theme'

// 路由器由外層（main.tsx）提供
const App = () => {
  return (
    <ConfigProvider locale={zhTW} theme={theme}>
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
