import * as SecureStore from 'expo-secure-store'

const KEYS = {
  ACCESS_TOKEN: 'expensia_access_token',
  REFRESH_TOKEN: 'expensia_refresh_token',
  BACKEND_USER: 'expensia_backend_user',
}

export async function saveTokens(accessToken, refreshToken) {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken)
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken)
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN)
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN)
}

export async function saveBackendUser(user) {
  await SecureStore.setItemAsync(KEYS.BACKEND_USER, JSON.stringify(user))
}

export async function getBackendUser() {
  const raw = await SecureStore.getItemAsync(KEYS.BACKEND_USER)
  return raw ? JSON.parse(raw) : null
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN)
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN)
  await SecureStore.deleteItemAsync(KEYS.BACKEND_USER)
}

export async function isLoggedIn() {
  const token = await getAccessToken()
  return !!token
}
