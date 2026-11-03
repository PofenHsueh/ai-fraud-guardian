export type Contact = {
  label: string
  // null 表示號碼尚未確認，畫面只顯示名稱、不做成撥號連結
  tel: string | null
}

export const fraudHotline: Contact = { label: '165 反詐騙專線', tel: '165' }

// TODO: 銀行客服號碼待計畫方確認後填入
export const bankService: Contact = { label: '銀行客服', tel: null }
