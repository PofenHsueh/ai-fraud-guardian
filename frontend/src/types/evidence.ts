// 前端畫面（①）與串接層（③）共用的資料型別
// url／text 欄位對應設計文件 6.1 的 evidence；image 由串接層壓縮上傳後換成 s3Key

export type GuardianMode = 'passive' | 'active'

export type ImageEvidence = {
  id: string
  type: 'image'
  file: File
  fileName: string
  sizeBytes: number
  previewUrl: string
}

export type UrlEvidence = { id: string; type: 'url'; value: string }

export type TextEvidence = { id: string; type: 'text'; value: string }

export type EvidenceItem = ImageEvidence | UrlEvidence | TextEvidence

export type EvidenceSubmission = {
  mode: GuardianMode
  items: EvidenceItem[]
  consentedAt: string
}
