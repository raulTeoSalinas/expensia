import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { initDB, runSQL, querySQL, queryOneSQL } from '../services/db'
import { syncOne } from '../services/syncService'
import { ErrorType } from '../services/apiService'
import { getIsOnline } from '../hooks/useNetworkStatus'
import { useAuth } from './authContext'
import Toast from 'react-native-toast-message'

export const ExpensiaContext = createContext(null)

const PAGE_SIZE = 20

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function showToast(errorType, isLoggedIn, logoutFn) {
  if (!isLoggedIn) {
    // Normal user — just confirm save
    if (errorType === null) Toast.show({ type: 'success', text1: 'Guardado' })
    else Toast.show({ type: 'error', text1: 'No se pudo guardar' })
    return
  }
  if (errorType === null) {
    Toast.show({ type: 'success', text1: 'Guardado y sincronizado' })
  } else if (errorType === ErrorType.NETWORK || errorType === ErrorType.SERVER) {
    Toast.show({ type: 'warning', text1: 'Guardado sin conexión', text2: 'Se sincronizará al recuperar internet' })
  } else if (errorType === ErrorType.CLIENT) {
    Toast.show({ type: 'error', text1: 'Error del servidor', text2: 'El cambio se guardó localmente' })
  } else if (errorType === ErrorType.SESSION_EXPIRED) {
    Toast.show({ type: 'error', text1: 'Sesión expirada', text2: 'Inicia sesión nuevamente' })
    logoutFn?.()
  }
}

const ExpensiaContextProvider = ({ children }) => {
  const { isLoggedIn, logout } = useAuth()
  const [user, setUser] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [txPage, setTxPage] = useState(0)
  const [hasMoreTx, setHasMoreTx] = useState(false)
  const [txFilter, setTxFilter] = useState({ month: null, accountId: null })

  // ─── Bootstrap ──────────────────────────────────────────────────────────────

  async function loadUser() {
    const row = await queryOneSQL('SELECT * FROM users LIMIT 1')
    setUser(row ?? null)
    return row
  }

  async function loadAccounts() {
    const rows = await querySQL('SELECT * FROM accounts')
    setAccounts(rows)
    return rows
  }

  async function loadTransactions({ month = null, accountId = null, reset = false } = {}) {
    const page = reset ? 0 : txPage
    const conditions = ['1=1']
    const params = []

    if (month) {
      conditions.push("date >= ? AND date < ?")
      const [year, monthNum] = month.split('-').map(Number)
      const next = monthNum === 12 ? `${year + 1}-01` : `${year}-${String(monthNum + 1).padStart(2, '0')}`
      params.push(`${month}-01`, `${next}-01`)
    }

    if (accountId) {
      conditions.push('accountId = ?')
      params.push(accountId)
    }

    params.push(PAGE_SIZE, page * PAGE_SIZE)

    const rows = await querySQL(
      `SELECT t.*,
        c.name AS customCategoryName, c.icon AS customCategoryIcon, c.type AS customCategoryType
       FROM transactions t
       LEFT JOIN custom_categories c ON t.customCategoryId = c.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY date DESC, rowid DESC
       LIMIT ? OFFSET ?`,
      params
    )

    setTransactions(prev => reset ? rows : [...prev, ...rows])
    setHasMoreTx(rows.length === PAGE_SIZE)
    if (reset) setTxPage(1); else setTxPage(p => p + 1)
    if (reset) setTxFilter({ month, accountId })
  }

  function loadMoreTransactions() {
    if (hasMoreTx) loadTransactions(txFilter)
  }

  useEffect(() => {
    async function bootstrap() {
      await initDB()
      await loadUser()
      await loadAccounts()
      await loadTransactions({ reset: true })
    }
    bootstrap()
  }, [])

  // ─── User ────────────────────────────────────────────────────────────────────

  async function createUser(name, language) {
    const id = generateId()
    await runSQL(
      'INSERT INTO users (id, name, language, isPrivacyEnabled) VALUES (?, ?, ?, 0)',
      [id, name, language]
    )
    const newUser = { id, name, language, isPrivacyEnabled: 0 }
    setUser(newUser)
    return newUser
  }

  async function updateUserName(newName) {
    await runSQL('UPDATE users SET name = ? WHERE id = ?', [newName, user.id])
    setUser(prev => ({ ...prev, name: newName }))
  }

  async function editUserLanguage(language) {
    await runSQL('UPDATE users SET language = ? WHERE id = ?', [language, user.id])
    setUser(prev => ({ ...prev, language }))
  }

  async function togglePrivacy() {
    const next = user.isPrivacyEnabled ? 0 : 1
    await runSQL('UPDATE users SET isPrivacyEnabled = ? WHERE id = ?', [next, user.id])
    setUser(prev => ({ ...prev, isPrivacyEnabled: next }))
  }

  async function deleteUser() {
    await runSQL('DELETE FROM users')
    await runSQL('DELETE FROM transactions')
    await runSQL('DELETE FROM accounts')
    await runSQL('DELETE FROM custom_categories')
    await runSQL('DELETE FROM sync_queue')
    setUser(null)
    setAccounts([])
    setTransactions([])
  }

  async function clearTransactions() {
    await runSQL('DELETE FROM transactions')
    setTransactions([])
    setTxPage(0)
    setHasMoreTx(true)
  }

  // ─── Accounts ────────────────────────────────────────────────────────────────

  async function addAccount(name, icon, isCC, initialAmount = 0) {
    const id = generateId()
    try {
      await runSQL(
        'INSERT INTO accounts (id, name, icon, isCC, amount, syncStatus) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, icon, isCC ? 1 : 0, initialAmount, isLoggedIn ? 'pending' : 'local']
      )
      const account = { id, name, icon, isCC: isCC ? 1 : 0, amount: initialAmount, syncStatus: isLoggedIn ? 'pending' : 'local', backendId: null }
      setAccounts(prev => [...prev, account])

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('account', 'CREATE', id, { name, icon, isCC: !!isCC, amount: initialAmount }, online)
        refreshAccount(id)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
      return account
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to save account')
    }
  }

  async function editAccount(id, name, icon) {
    try {
      await runSQL('UPDATE accounts SET name = ?, icon = ? WHERE id = ?', [name, icon, id])
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, name, icon } : a))

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('account', 'UPDATE', id, { name, icon }, online)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to update account')
    }
  }

  async function deleteAccount(id) {
    try {
      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('account', 'DELETE', id, {}, online)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
      // Delete locally after (or regardless of sync result, since cascade will clean transactions)
      await runSQL('DELETE FROM accounts WHERE id = ?', [id])
      setAccounts(prev => prev.filter(a => a.id !== id))
      setTransactions(prev => prev.filter(t => t.accountId !== id))
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to delete account')
    }
  }

  async function addOrRestAmount(amount, type, accountId) {
    const delta = type === 'i' ? parseFloat(amount) : -parseFloat(amount)
    await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [delta, accountId])
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, amount: a.amount + delta } : a))
  }

  async function refreshAccount(id) {
    const row = await queryOneSQL('SELECT * FROM accounts WHERE id = ?', [id])
    if (row) setAccounts(prev => prev.map(a => a.id === id ? row : a))
  }

  // ─── Transactions ─────────────────────────────────────────────────────────────

  async function addTransaction({ type, amount, accountId, date, globalCategoryId, customCategoryId, description }) {
    const id = generateId()
    try {
      await runSQL(
        `INSERT INTO transactions (id, type, amount, date, description, accountId, globalCategoryId, customCategoryId, syncStatus)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, type, parseFloat(amount), date, description ?? null, accountId, globalCategoryId ?? null, customCategoryId ?? null, isLoggedIn ? 'pending' : 'local']
      )
      // Update account balance locally
      await addOrRestAmount(amount, type, accountId)

      const newTx = { id, type, amount: parseFloat(amount), date, description, accountId, globalCategoryId, customCategoryId, syncStatus: isLoggedIn ? 'pending' : 'local', backendId: null }
      setTransactions(prev => [newTx, ...prev])

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
        refreshTransaction(id)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
      return id
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to save transaction')
    }
  }

  async function editTransaction(id, { type, amount, accountId, date, globalCategoryId, customCategoryId, description }) {
    try {
      const old = await queryOneSQL('SELECT * FROM transactions WHERE id = ?', [id])

      // Reverse old balance effect, apply new
      const reverseDelta = old.type === 'i' ? -parseFloat(old.amount) : parseFloat(old.amount)
      await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [reverseDelta, old.accountId])

      const newDelta = type === 'i' ? parseFloat(amount) : -parseFloat(amount)
      await runSQL('UPDATE accounts SET amount = amount + ? WHERE id = ?', [newDelta, accountId])

      await runSQL(
        `UPDATE transactions SET type=?, amount=?, date=?, description=?, accountId=?, globalCategoryId=?, customCategoryId=? WHERE id=?`,
        [type, parseFloat(amount), date, description ?? null, accountId, globalCategoryId ?? null, customCategoryId ?? null, id]
      )

      setTransactions(prev => prev.map(t => t.id === id ? { ...t, type, amount: parseFloat(amount), date, description, accountId, globalCategoryId, customCategoryId } : t))
      await refreshAccount(old.accountId)
      if (accountId !== old.accountId) await refreshAccount(accountId)

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
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
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

      setTransactions(prev => prev.filter(t => t.id !== id))
      await refreshAccount(tx.accountId)

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('transaction', 'DELETE', id, {}, online)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to delete transaction')
    }
  }

  async function refreshTransaction(id) {
    const row = await queryOneSQL('SELECT * FROM transactions WHERE id = ?', [id])
    if (row) setTransactions(prev => prev.map(t => t.id === id ? row : t))
  }

  // ─── Custom Categories ────────────────────────────────────────────────────────

  async function addCustomCategory(name, type, icon) {
    const id = generateId()
    try {
      await runSQL(
        'INSERT INTO custom_categories (id, name, type, icon, syncStatus) VALUES (?, ?, ?, ?, ?)',
        [id, name, type, icon, isLoggedIn ? 'pending' : 'local']
      )

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('customCategory', 'CREATE', id, { name, type, icon }, online)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
      return { id, name, type, icon }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to save category')
    }
  }

  async function editCustomCategory(id, name, icon) {
    try {
      await runSQL('UPDATE custom_categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id])

      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('customCategory', 'UPDATE', id, { name, icon }, online)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to update category')
    }
  }

  async function deleteCustomCategory(id) {
    try {
      if (isLoggedIn) {
        const online = await getIsOnline()
        const errorType = await syncOne('customCategory', 'DELETE', id, {}, online)
        showToast(errorType, isLoggedIn, logout)
      } else {
        showToast(null, false)
      }
      await runSQL('DELETE FROM custom_categories WHERE id = ?', [id])
    } catch {
      showToast('LOCAL_ERROR', isLoggedIn, logout)
      throw new Error('Failed to delete category')
    }
  }

  // ─── Context value ────────────────────────────────────────────────────────────

  const value = {
    // State
    user,
    accounts,
    transactions,
    hasMoreTx,
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
    loadTransactions,
    loadMoreTransactions,
    // Custom Categories
    addCustomCategory,
    editCustomCategory,
    deleteCustomCategory,
    // Reload helpers
    loadUser,
    loadAccounts,
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
