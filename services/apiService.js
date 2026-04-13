import * as authService from './authService'

// Change to your backend URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

// Error types
export const ErrorType = {
  NETWORK: 'NETWORK',   // no internet / timeout → retry
  SERVER: 'SERVER',     // 5xx → retry
  CLIENT: 'CLIENT',     // 4xx → don't retry
  SESSION_EXPIRED: 'SESSION_EXPIRED', // refresh failed
}

async function buildHeaders() {
  const token = await authService.getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function attemptFetch(endpoint, options) {
  const headers = await buildHeaders()
  return fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
}

export async function callAPI(endpoint, options = {}) {
  try {
    let res = await attemptFetch(endpoint, options)

    // Silent token refresh on 401
    if (res.status === 401) {
      const refreshToken = await authService.getRefreshToken()
      if (!refreshToken) return { data: null, errorType: ErrorType.SESSION_EXPIRED }

      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!refreshRes.ok) {
        await authService.clearAuth()
        return { data: null, errorType: ErrorType.SESSION_EXPIRED }
      }

      const { accessToken } = await refreshRes.json()
      await authService.saveTokens(accessToken, refreshToken)

      // Retry original request with new token
      res = await attemptFetch(endpoint, options)
    }

    if (res.status >= 500) return { data: null, errorType: ErrorType.SERVER }
    if (!res.ok) return { data: null, errorType: ErrorType.CLIENT }

    const data = await res.json()
    return { data, errorType: null }

  } catch {
    // fetch() throws on network errors (no connection, timeout)
    return { data: null, errorType: ErrorType.NETWORK }
  }
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Invalid credentials')
  }

  return res.json()
}
