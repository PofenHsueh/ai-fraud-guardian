import { LeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import type { ReactNode } from 'react'
import styles from './Page.module.css'

type Props = {
  title: string
  onBack?: () => void
  footer?: ReactNode
  children: ReactNode
}

export function Page({ title, onBack, footer, children }: Props) {
  return (
    <>
      <header className={onBack ? styles.header : `${styles.header} ${styles.titleOnly}`}>
        {onBack && <Button type="text" icon={<LeftOutlined />} aria-label="返回" onClick={onBack} />}
        <h1 className={styles.title}>{title}</h1>
      </header>
      <main className={styles.body}>{children}</main>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </>
  )
}
