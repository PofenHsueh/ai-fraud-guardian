import { RightOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import styles from './GuardianEntryCard.module.css'

type Props = { onClick: () => void }

// 以淺綠卡片呈現，避免與實心的「確認轉帳」搶主要動作
export const GuardianEntryCard = ({ onClick }: Props) => {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <SafetyCertificateOutlined className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.title}>防詐安全守門員：先查證再確認</span>
        <span className={styles.hint}>轉帳前不確定對方身分？讓 AI 幫您查證</span>
      </span>
      <RightOutlined className={styles.arrow} />
    </button>
  )
}
