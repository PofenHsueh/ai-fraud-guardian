import type { ReactNode } from 'react'
import styles from './MobileLayout.module.css'

type Props = { children: ReactNode }

// 桌面瀏覽器開啟時也維持手機寬度
export function MobileLayout({ children }: Props) {
  return <div className={styles.shell}>{children}</div>
}
