import React, { createContext, useContext, useState, useEffect } from 'react'
import { AppState } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import * as authService from '../services/authService'
import * as apiService from '../services/apiService'
import { login as apiLogin } from '../services/apiService'
import { initialSync, pullFromBackend } from '../services/syncService'
import Toast from 'react-native-toast-message'

const AuthContext = createContext(null)

export function AuthContextProvider({ children }) {
  const qc = useQueryClient()
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
        // Pull backend → SQLite on every cold start so Device B sees changes from Device A
        const ok = await pullFromBackend()
        if (ok) qc.invalidateQueries()
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  // Pull backend → SQLite whenever the app comes back to the foreground (logged-in only)
  useEffect(() => {
    if (!isLoggedIn) return
    const sub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        const ok = await pullFromBackend()
        if (ok) qc.invalidateQueries()
      }
    })
    return () => sub.remove()
  }, [isLoggedIn])

  async function login(email, password) {
    const { user, accessToken, refreshToken } = await apiLogin(email, password)
    await authService.saveTokens(accessToken, refreshToken)
    await authService.saveBackendUser(user)
    setBackendUser(user)
    setIsLoggedIn(true)

    // Pull backend → SQLite, then push any local-only data
    const synced = await initialSync()
    // Force all queries to refetch from SQLite so the UI shows the pulled data
    qc.invalidateQueries()
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
    qc.invalidateQueries()
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
