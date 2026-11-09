const ID_TOKEN_KEY = 'cognito_id_token'
const REFRESH_TOKEN_KEY = 'cognito_refresh_token'

type CognitoAuthResult = {
  AuthenticationResult?: {
    IdToken?: string
    AccessToken?: string
    RefreshToken?: string
  }
  message?: string
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

export const getStoredIdToken = (): string | null => {
  const stored = window.sessionStorage.getItem(ID_TOKEN_KEY)
  if (stored && stored.trim().length > 0) return stored.trim()
  const envToken = import.meta.env.VITE_COGNITO_TOKEN
  if (typeof envToken === 'string' && envToken.trim().length > 0) return envToken.trim()
  return null
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
  const response = await fetch(endpoint, {
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

  const data = (await response.json()) as CognitoAuthResult
  if (!response.ok || !data.AuthenticationResult?.IdToken) {
    throw new Error(data.message ?? '帳號或密碼錯誤，請重新輸入')
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

    window.sessionStorage.setItem(ID_TOKEN_KEY, nextIdToken)
    return nextIdToken
  } catch {
    clearAuthTokens()
    return null
  }
}

