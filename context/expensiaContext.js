import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { initDB, runSQL, querySQL, queryOneSQL } from '../services/db'
import { syncOne } from '../services/syncService'
import { ErrorType } from '../services/apiService'
import { getIsOnline } from '../hooks/useNetworkStatus'
import { useAuth } from './authContext'
import { QK } from '../hooks/queries'
import Toast from 'react-native-toast-message'
import { es, en } from '../utils/languages'

export const ExpensiaContext = createContext(null)

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function showToast(errorType, isLoggedIn, logoutFn, t) {
  if (!isLoggedIn) {
    if (errorType === null) Toast.show({ type: 'success', text1: t.savedLocal })
    else Toast.show({ type: 'error', text1: t.saveFailed })
    return
  }
  if (errorType === null) {
    Toast.show({ type: 'success', text1: t.savedSynced })
  } else if (errorType === ErrorType.NETWORK || errorType === ErrorType.SERVER) {
    Toast.show({ type: 'warning', text1: t.savedOfflineTitle, text2: t.savedOfflineSub })
  } else if (errorType === ErrorType.CLIENT) {
    Toast.show({ type: 'error', text1: t.serverErrorTitle, text2: t.serverErrorSub })
  } else if (errorType === ErrorType.SESSION_EXPIRED) {
    Toast.show({ type: 'error', text1: t.sessionExpiredTitle, text2: t.sessionExpiredSub })
    logoutFn?.()
  }
}

const ExpensiaContextProvider = ({ children }) => {
  const { isLoggedIn, backendUser, loading: authLoading, logout } = useAuth()
  const qc = useQueryClient()
  const [user, setUser] = useState(null)
  const [dbReady, setDbReady] = useState(false)

  const toastT = useMemo(() => (user?.language === 'en' ? en : es).toast, [user?.language])

  // ─── Invalidation ─────────────────────────────────────────────────────────

  function invalidateTransactionQueries() {
    qc.invalidateQueries({ queryKey: ['transactions'] })
    qc.invalidateQueries({ queryKey: ['transactionSearch'] })
    qc.invalidateQueries({ queryKey: ['monthSummary'] })
    qc.invalidateQueries({ queryKey: ['calendarDots'] })
    qc.invalidateQueries({ queryKey: ['monthCategoryBreakdown'] })
    qc.invalidateQueries({ queryKey: ['dayTransactions'] })
    qc.invalidateQueries({ queryKey: ['transaction'] })
  }

  function invalidateAccountQueries() {
    qc.invalidateQueries({ queryKey: QK.accounts })
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  useEffect(() => {
    async function bootstrap() {
      await initDB()
      const row = await queryOneSQL('SELECT * FROM users LIMIT 1')
      setUser(row ?? null)
      setDbReady(true)
    }
    bootstrap()
  }, [])

  // Sesión remota sin fila local (p. ej. login oculto en bienvenida): crear usuario en SQLite para que la navegación muestre Tabs.
  useEffect(() => {
    if (!dbReady || authLoading || !isLoggedIn || user) return

    let cancelled = false

    async function hydrateLocalUserFromSession() {
      const existing = await queryOneSQL('SELECT * FROM users LIMIT 1')
      if (cancelled) return
      if (existing) {
        setUser(existing)
        qc.setQueryData(QK.user, existing)
        return
      }

      if (!backendUser) return

      const id =
        backendUser.id != null
          ? String(backendUser.id)
          : backendUser.sub != null
            ? String(backendUser.sub)
            : generateId()
      const name =
        (typeof backendUser.name === 'string' && backendUser.name.trim()) ||
        (typeof backendUser.email === 'string' && backendUser.email.split('@')[0]) ||
        'Usuario'
      const language =
        backendUser.language === 'en' || backendUser.language === 'es'
          ? backendUser.language
          : 'es'

      try {
        await runSQL(
          'INSERT INTO users (id, name, language, isPrivacyEnabled) VALUES (?, ?, ?, 0)',
          [id, name, language]
        )
      } catch (e) {
        console.error('hydrateLocalUserFromSession', e)
        return
      }

      if (cancelled) return
      const row = await queryOneSQL('SELECT * FROM users LIMIT 1')
      if (row) {
        setUser(row)
        qc.setQueryData(QK.user, row)
      }
    }

    void hydrateLocalUserFromSession()
    return () => {
      cancelled = true
    }
  }, [dbReady, authLoading, isLoggedIn, backendUser, user, qc])

  // ─── User ─────────────────────────────────────────────────────────────────

  async function createUser(name, language) {
    const id = generateId()
    await runSQL(
      'INSERT INTO users (id, name, language, isPrivacyEnabled) VALUES (?, ?, ?, 0)',
      [id, name, language]
    )
    const newUser = { id, name, language, isPrivacyEnabled: 0 }
    setUser(newUser)
    qc.setQueryData(QK.user, newUser)
    return newUser
  }

  async function updateUserName(newName) {
    await runSQL('UPDATE users SET name = ? WHERE id = ?', [newName, user.id])
    const updated = { ...user, name: newName }
    setUser(updated)
    qc.setQueryData(QK.user, updated)
  }

  async function editUserLanguage(language) {
    await runSQL('UPDATE users SET language = ? WHERE id = ?', [language, user.id])
    const updated = { ...user, language }
    setUser(updated)
    qc.setQueryData(QK.user, updated)
  }

  async function togglePrivacy() {
    const next = user.isPrivacyEnabled ? 0 : 1
    await runSQL('UPDATE users SET isPrivacyEnabled = ? WHERE id = ?', [next, user.id])
    const updated = { ...user, isPrivacyEnabled: next }
    setUser(updated)
    qc.setQueryData(QK.user, updated)
  }

  async function deleteUser() {
    await runSQL('DELETE FROM users')
    await runSQL('DELETE FROM transactions')
    await runSQL('DELETE FROM accounts')
    await runSQL('DELETE FROM custom_categories')
    await runSQL('DELETE FROM sync_queue')
    setUser(null)
    qc.clear()
  }

  async function clearTransactions() {
    await runSQL('DELETE FROM transactions')
    invalidateTransactionQueries()
  }

  // ─── Accounts ─────────────────────────────────────────────────────────────

  async function addAccount(name, icon, isCC, initialAmount = 0) {
    const id = generateId()
    try {
      await runSQL(
        'INSERT INTO accounts (id, name, icon, isCC, amount, syncStatus) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, icon, isCC ? 1 : 0, initialAmount, isLoggedIn ? 'pending' : 'local']
      )
      invalidateAccountQueries()

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('account', 'CREATE', id, { name, icon, isCC: !!isCC, amount: initialAmount }, online)
        invalidateAccountQueries()
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
      return id
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to save account')
    }
  }

  async function editAccount(id, name, icon) {
    try {
      await runSQL('UPDATE accounts SET name = ?, icon = ? WHERE id = ?', [name, icon, id])
      invalidateAccountQueries()

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('account', 'UPDATE', id, { name, icon }, online)
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to update account')
    }
  }

  async function deleteAccount(id) {
    try {
      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('account', 'DELETE', id, {}, online)
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
      await runSQL('DELETE FROM accounts WHERE id = ?', [id])
      invalidateAccountQueries()
      invalidateTransactionQueries()
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to delete account')
    }
  }

  async function addOrRestAmount(amount, type, accountId) {
    const delta = type === 'i' ? parseFloat(amount) : -parseFloat(amount)
    await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [delta, accountId])
    invalidateAccountQueries()
  }

  // ─── Transactions ──────────────────────────────────────────────────────────

  async function addTransaction({ type, amount, accountId, date, globalCategoryId, customCategoryId, description }) {
    const id = generateId()
    try {
      await runSQL(
        `INSERT INTO transactions (id, type, amount, date, description, accountId, globalCategoryId, customCategoryId, syncStatus)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, type, parseFloat(amount), date, description ?? null, accountId,
         globalCategoryId ?? null, customCategoryId ?? null, isLoggedIn ? 'pending' : 'local']
      )
      const delta = type === 'i' ? parseFloat(amount) : -parseFloat(amount)
      await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [delta, accountId])

      invalidateTransactionQueries()
      invalidateAccountQueries()

      if (isLoggedIn) {
        const accountRow = await queryOneSQL('SELECT backendId FROM accounts WHERE id = ?', [accountId])
        const catRow = customCategoryId ? await queryOneSQL('SELECT backendId FROM custom_categories WHERE id = ?', [customCategoryId]) : null
        const online = await getIsOnline()
        const errorType = await syncOne('transaction', 'CREATE', id, {
          type, amount: parseFloat(amount), date, description: description ?? null,
          idAccount: accountRow?.backendId ?? null,
          idCustomCategory: catRow?.backendId ?? null,
          idGlobalCategory: globalCategoryId ?? null,
        }, online)
        invalidateTransactionQueries()
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
      return id
    } catch (e) {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to save transaction')
    }
  }

  async function editTransaction(id, { type, amount, accountId, date, globalCategoryId, customCategoryId, description }) {
    try {
      const old = await queryOneSQL('SELECT * FROM transactions WHERE id = ?', [id])

      const reverseDelta = old.type === 'i' ? -parseFloat(old.amount) : parseFloat(old.amount)
      await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [reverseDelta, old.accountId])

      const newDelta = type === 'i' ? parseFloat(amount) : -parseFloat(amount)
      await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [newDelta, accountId])

      await runSQL(
        `UPDATE transactions SET type=?, amount=?, date=?, description=?, accountId=?, globalCategoryId=?, customCategoryId=? WHERE id=?`,
        [type, parseFloat(amount), date, description ?? null, accountId,
         globalCategoryId ?? null, customCategoryId ?? null, id]
      )

      invalidateTransactionQueries()
      invalidateAccountQueries()

      if (isLoggedIn) {
        const accountRow = await queryOneSQL('SELECT backendId FROM accounts WHERE id = ?', [accountId])
        const catRow = customCategoryId ? await queryOneSQL('SELECT backendId FROM custom_categories WHERE id = ?', [customCategoryId]) : null
        const online = await getIsOnline()
        const errorType = await syncOne('transaction', 'UPDATE', id, {
          type, amount: parseFloat(amount), date, description: description ?? null,
          idAccount: accountRow?.backendId ?? null,
          idCustomCategory: catRow?.backendId ?? null,
          idGlobalCategory: globalCategoryId ?? null,
        }, online)
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to update transaction')
    }
  }

  async function removeTransaction(id) {
    try {
      const tx = await queryOneSQL('SELECT * FROM transactions WHERE id = ?', [id])
      if (!tx) return

      const reverseDelta = tx.type === 'i' ? -parseFloat(tx.amount) : parseFloat(tx.amount)
      await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [reverseDelta, tx.accountId])
      await runSQL('DELETE FROM transactions WHERE id = ?', [id])

      invalidateTransactionQueries()
      invalidateAccountQueries()

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('transaction', 'DELETE', id, {}, online)
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to delete transaction')
    }
  }

  // ─── Custom Categories ─────────────────────────────────────────────────────

  async function addCustomCategory(name, type, icon) {
    const id = generateId()
    try {
      await runSQL(
        'INSERT INTO custom_categories (id, name, type, icon, syncStatus) VALUES (?, ?, ?, ?, ?)',
        [id, name, type, icon, isLoggedIn ? 'pending' : 'local']
      )
      qc.invalidateQueries({ queryKey: QK.customCategories })

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('customCategory', 'CREATE', id, { name, type, icon }, online)
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
      return { id, name, type, icon }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to save category')
    }
  }

  async function editCustomCategory(id, name, icon) {
    try {
      await runSQL('UPDATE custom_categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id])
      qc.invalidateQueries({ queryKey: QK.customCategories })

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('customCategory', 'UPDATE', id, { name, icon }, online)
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to update category')
    }
  }

  async function deleteCustomCategory(id) {
    try {
      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('customCategory', 'DELETE', id, {}, online)
        showToast(errorType, isLoggedIn, logout, toastT)
      } else {
        showToast(null, false, logout, toastT)
      }
      await runSQL('DELETE FROM custom_categories WHERE id = ?', [id])
      qc.invalidateQueries({ queryKey: QK.customCategories })
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout, toastT)
      throw new Error('Failed to delete category')
    }
  }

  // ─── Context value ─────────────────────────────────────────────────────────

  const value = {
    user,
    dbReady,
    // User
    createUser,
    deleteUser,
    updateUserName,
    editUserLanguage,
    togglePrivacy,
    clearTransactions,
    // Accounts
    addAccount,
    editAccount,
    deleteAccount,
    addOrRestAmount,
    // Transactions
    addTransaction,
    editTransaction,
    removeTransaction,
    // Custom Categories
    addCustomCategory,
    editCustomCategory,
    deleteCustomCategory,
  }

  return (
    <ExpensiaContext.Provider value={value}>
      {children}
    </ExpensiaContext.Provider>
  )
}

export function useExpensia() {
  return useContext(ExpensiaContext)
}

export default ExpensiaContextProvider
