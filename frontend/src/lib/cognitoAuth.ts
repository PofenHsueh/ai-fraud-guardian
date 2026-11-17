const ID_TOKEN_KEY = 'cognito_id_token'
const REFRESH_TOKEN_KEY = 'cognito_refresh_token'

type CognitoAuthResult = {
  AuthenticationResult?: {
    IdToken?: string
    AccessToken?: string
    RefreshToken?: string
  }
  ChallengeName?: string
  __type?: string
  message?: string
}

const SIGN_IN_FAILED_MESSAGE = '登入帳號或密碼有誤，請重新輸入'

// 將 Cognito 的英文錯誤轉成給客戶看的中文提示；帳號不存在與密碼錯誤一律回同一句，避免洩漏帳號是否存在
const toSignInErrorMessage = (data: CognitoAuthResult): string => {
  if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') return '此帳號需要先變更密碼，請聯絡管理員'
  switch (data.__type) {
    case 'NotAuthorizedException':
    case 'UserNotFoundException':
      return SIGN_IN_FAILED_MESSAGE
    case 'UserNotConfirmedException':
      return '此帳號尚未完成驗證，請聯絡管理員'
    case 'PasswordResetRequiredException':
      return '此帳號需要重設密碼，請聯絡管理員'
    case 'TooManyRequestsException':
    case 'LimitExceededException':
      return '嘗試次數過多，請稍後再試'
    default:
      return '登入失敗，請稍後再試'
  }
}

const getCognitoRegion = (): string => {
  const raw = import.meta.env.VITE_COGNITO_REGION
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : 'ap-northeast-1'
}

const getCognitoClientId = (): string => {
  const raw = import.meta.env.VITE_COGNITO_CLIENT_ID
  return typeof raw === 'string' ? raw.trim() : ''
}

export const isCognitoConfigured = (): boolean => {
  return getCognitoClientId().length > 0
}

// 路由守衛用：有設定 Cognito 時，必須在本次工作階段登入成功並取得 ID Token 才算已登入；
// ID Token 過期時由 API 呼叫遇到 401 再用 Refresh Token 換發，這裡不檢查到期時間
export const isSignedIn = (): boolean => {
  if (!isCognitoConfigured()) return true
  return Boolean(window.sessionStorage.getItem(ID_TOKEN_KEY))
}

export const getStoredIdToken = (): string | null => {
  const stored = window.sessionStorage.getItem(ID_TOKEN_KEY)
  if (stored && stored.trim().length > 0) return stored.trim()
  const envToken = import.meta.env.VITE_COGNITO_TOKEN
  if (typeof envToken === 'string' && envToken.trim().length > 0) return envToken.trim()
  return null
}

// 從 ID Token 取出顯示用名稱；只用於畫面顯示，不做驗證
export const getSignedInName = (): string | null => {
  const token = getStoredIdToken()
  const payload = token?.split('.')[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
    // 以 email 登入的 User Pool，cognito:username 是系統產生的 UUID，因此優先顯示使用者實際輸入的登入帳號 email
    const name = claims.email ?? claims.name ?? claims['cognito:username']
    return typeof name === 'string' && name.trim() !== '' ? name.trim() : null
  } catch {
    return null
  }
}

export const clearAuthTokens = () => {
  window.sessionStorage.removeItem(ID_TOKEN_KEY)
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

// 透過 AWS Cognito IDP 原生 JSON-RPC 進行帳號密碼登入（需在 Cognito App Client 啟用 ALLOW_USER_PASSWORD_AUTH）
export const signInWithCognito = async (username: string, password: string): Promise<void> => {
  const clientId = getCognitoClientId()
  if (!clientId) return

  const endpoint = `https://cognito-idp.${getCognitoRegion()}.amazonaws.com/`
  let response: Response
  let data: CognitoAuthResult
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: username.trim(),
          PASSWORD: password,
        },
      }),
    })
    data = (await response.json()) as CognitoAuthResult
  } catch {
    throw new Error('網路連線異常，請稍後再試')
  }

  if (!response.ok || !data.AuthenticationResult?.IdToken) {
    throw new Error(toSignInErrorMessage(data))
  }

  window.sessionStorage.setItem(ID_TOKEN_KEY, data.AuthenticationResult.IdToken)
  if (data.AuthenticationResult.RefreshToken) {
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, data.AuthenticationResult.RefreshToken)
  }
}

// 當 API 回傳 401 時，自動使用 RefreshToken 換發新的 IdToken（對應設計文件 4.2）
export const refreshCognitoToken = async (): Promise<string | null> => {
  const clientId = getCognitoClientId()
  const refreshToken = window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
  if (!clientId || !refreshToken) {
    clearAuthTokens()
    return null
  }

  try {
    const endpoint = `https://cognito-idp.${getCognitoRegion()}.amazonaws.com/`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
      },
      body: JSON.stringify({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      }),
    })

    const data = (await response.json()) as CognitoAuthResult
    const nextIdToken = data.AuthenticationResult?.IdToken
    if (!response.ok || !nextIdToken) {
      clearAuthTokens()
      return null
    }

    // 換發期間使用者已登出（Refresh Token 已被清除）時，不可把新 Token 寫回去
    if (!window.sessionStorage.getItem(REFRESH_TOKEN_KEY)) return null
    window.sessionStorage.setItem(ID_TOKEN_KEY, nextIdToken)
    return nextIdToken
  } catch {
    clearAuthTokens()
    return null
  }
}

