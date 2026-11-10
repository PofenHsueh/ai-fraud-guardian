import type { Decision } from '@/types/analysis'
import type { GuardianMode } from '@/types/evidence'
import { getStoredIdToken, refreshCognitoToken } from './cognitoAuth'

export class ApiHttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const getApiBaseUrl = (): string => {
  const raw = import.meta.env.VITE_API_BASE_URL
  return typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : ''
}

export const isApiConfigured = (): boolean => {
  return getApiBaseUrl().length > 0
}

const buildHeaders = (contentType: string, tokenOverride?: string | null): HeadersInit => {
  const headers: Record<string, string> = { 'Content-Type': contentType }
  const token = tokenOverride ?? getStoredIdToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

// 統一處理 API 請求；遇到 401 時先嘗試透過 Cognito Refresh Token 自動更新並重試一次
const fetchWithAuthRetry = async (path: string, contentType: string, init: Omit<RequestInit, 'headers'>): Promise<Response> => {
  const url = `${getApiBaseUrl()}${path}`
  const firstResponse = await fetch(url, {
    ...init,
    headers: buildHeaders(contentType),
  })

  if (firstResponse.status !== 401) {
    return firstResponse
  }

  const refreshedToken = await refreshCognitoToken()
  if (!refreshedToken) {
    return firstResponse
  }

  return fetch(url, {
    ...init,
    headers: buildHeaders(contentType, refreshedToken),
  })
}

const requestJson = async <T>(path: string, init: Omit<RequestInit, 'headers'>): Promise<T> => {
  const response = await fetchWithAuthRetry(path, 'application/json', init)
  if (!response.ok) {
    throw new ApiHttpError(response.status, `API request failed with status ${response.status}`)
  }
  return (await response.json()) as T
}

export type CreateCaseEvidenceItem =
  | { type: 'image'; fileName: string }
  | { type: 'url'; value: string }
  | { type: 'text'; value: string }

export type CreateCaseResponse = {
  caseId: string
  userId: string
  status: string
  submittedAt: string
}

export type AnalyzeEvidencePayload =
  | { type: 'image'; s3Key: string }
  | { type: 'url'; value: string }
  | { type: 'text'; value: string }

export type CaseStatusResponse = {
  caseId: string
  status: 'SUBMITTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  result?: {
    schemaVersion?: string
    riskLevel?: string | null
    fraudType?: string | null
    signals?: string[]
    suggestion?: string | null
    errorCode?: string | null
  }
}

// API 1: POST /cases (DynamoDB PutItem)
export const createCase = async (params: {
  mode: GuardianMode
  consentedAt: string
  evidence: CreateCaseEvidenceItem[]
}): Promise<CreateCaseResponse> => {
  return requestJson<CreateCaseResponse>('/cases', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// API 2: PUT /cases/{id}/files/{n} (S3 PutObject)
export const uploadCaseFile = async (
  caseId: string,
  fileName: string,
  blob: Blob,
  contentType: string,
): Promise<void> => {
  const response = await fetchWithAuthRetry(
    `/cases/${encodeURIComponent(caseId)}/files/${encodeURIComponent(fileName)}`,
    contentType,
    {
      method: 'PUT',
      body: blob,
    },
  )
  if (!response.ok) {
    throw new ApiHttpError(response.status, `S3 file upload failed with status ${response.status}`)
  }
}

// API 3: POST /cases/{id}/analyze (Step Functions StartExecution - 交接點 A)
export const startCaseAnalysis = async (
  caseId: string,
  params: {
    mode: GuardianMode
    submittedAt: string
    evidence: AnalyzeEvidencePayload[]
  },
): Promise<void> => {
  await requestJson(`/cases/${encodeURIComponent(caseId)}/analyze`, {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

// API 4: GET /cases/{id} (DynamoDB GetItem - 讀取交接點 C)
export const getCaseStatus = async (caseId: string): Promise<CaseStatusResponse> => {
  return requestJson<CaseStatusResponse>(`/cases/${encodeURIComponent(caseId)}`, {
    method: 'GET',
  })
}

// API 5: POST /cases/{id}/decision (DynamoDB UpdateItem)
export const reportCaseDecision = async (caseId: string, decision: Decision): Promise<void> => {
  await requestJson(`/cases/${encodeURIComponent(caseId)}/decision`, {
    method: 'POST',
    body: JSON.stringify({ decision }),
  })
}
