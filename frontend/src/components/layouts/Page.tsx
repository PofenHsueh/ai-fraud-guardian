import { LeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import type { ReactNode } from 'react'
import { BRAND_COLOR } from '@/config/theme'
import styles from './Page.module.css'

type Props = {
  title: string
  onBack?: () => void
  // 頁首右側內容，例如使用者名稱與登出；分析畫面不提供
  headerExtra?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

// 頁首格式：返回按鈕（選用）、CUBE｜標題，右側放 headerExtra
export const Page = ({ title, onBack, headerExtra, footer, children }: Props) => {
  return (
    <>
      <header className={onBack ? styles.header : `${styles.header} ${styles.noBack}`}>
        {onBack && <Button type="text" icon={<LeftOutlined />} aria-label="返回" onClick={onBack} />}
        <span className={styles.brand} style={{ color: BRAND_COLOR }}>
          CUBE
        </span>
        <span className={styles.divider} aria-hidden="true" />
        <h1 className={styles.title}>{title}</h1>
        {headerExtra && <div className={styles.extra}>{headerExtra}</div>}
      </header>
      <main className={styles.body}>{children}</main>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </>
  )
}
