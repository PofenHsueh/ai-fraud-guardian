import type { ThemeConfig } from 'antd'

// iOS Safari 在輸入框字級小於 16px 時會自動放大畫面，所以字級固定 16px
export const MOBILE_FONT_SIZE = 16
export const MOBILE_CONTROL_HEIGHT = 44
// 版型最大寬度，與 MobileLayout.module.css 的 max-width 一致
export const MOBILE_MAX_WIDTH = 480
// 一般彈窗寬度，需小於版型寬度；手機上 antd 會自動縮成螢幕寬度扣掉邊距
export const MOBILE_MODAL_WIDTH = 400

export const theme: ThemeConfig = {
  token: {
    fontSize: MOBILE_FONT_SIZE,
    controlHeight: MOBILE_CONTROL_HEIGHT,
    controlHeightLG: 52,
    borderRadius: 8,
  },
}
