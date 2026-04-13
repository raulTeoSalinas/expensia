import React, { createContext, useContext, useState, useEffect } from 'react'
import * as authService from '../services/authService'
import * as apiService from '../services/apiService'
import { login as apiLogin } from '../services/apiService'
import { initialSync } from '../services/syncService'
import Toast from 'react-native-toast-message'

const AuthContext = createContext(null)

export function AuthContextProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [backendUser, setBackendUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const loggedIn = await authService.isLoggedIn()
      if (loggedIn) {
        const user = await authService.getBackendUser()
        setBackendUser(user)
        setIsLoggedIn(true)
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  async function login(email, password) {
    const { user, accessToken, refreshToken } = await apiLogin(email, password)
    await authService.saveTokens(accessToken, refreshToken)
    await authService.saveBackendUser(user)
    setBackendUser(user)
    setIsLoggedIn(true)

    // Upload all local data to backend
    const synced = await initialSync()
    if (synced) {
      Toast.show({ type: 'success', text1: 'Sesión iniciada', text2: 'Datos sincronizados con la nube' })
    } else {
      Toast.show({ type: 'warning', text1: 'Sesión iniciada', text2: 'Sin conexión — los datos se sincronizarán después' })
    }
  }

  async function logout() {
    await authService.clearAuth()
    setIsLoggedIn(false)
    setBackendUser(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, backendUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
