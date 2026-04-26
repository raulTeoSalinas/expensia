import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { querySQL, queryOneSQL } from '../services/db'
import Colors from '../constants/colors'

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const QK = {
  user: ['user'],
  accounts: ['accounts'],
  transactions: (filters) => ['transactions', filters],
  transactionSearch: (text, type) => ['transactionSearch', text, type],
  monthSummary: (month) => ['monthSummary', month],
  calendarDots: (month) => ['calendarDots', month],
  dayTransactions: (date) => ['dayTransactions', date],
  customCategories: ['customCategories'],
}

const PAGE_SIZE = 20

// ─── User ─────────────────────────────────────────────────────────────────────

export function useUser() {
  return useQuery({
    queryKey: QK.user,
    queryFn: () => queryOneSQL('SELECT * FROM users LIMIT 1'),
    staleTime: Infinity,
  })
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export function useAccounts() {
  return useQuery({
    queryKey: QK.accounts,
    queryFn: () => querySQL('SELECT * FROM accounts ORDER BY isCC ASC, rowid ASC'),
    staleTime: 30_000,
  })
}

// ─── Transactions (infinite scroll, with type filter) ─────────────────────────

export function useTransactions({ type = 'all' } = {}) {
  const typeCondition = type === 'all' ? '' : 'AND t.type = ?'
  const typeParam = type === 'all' ? [] : [type]

  return useInfiniteQuery({
    queryKey: QK.transactions({ type }),
    queryFn: async ({ pageParam = 0 }) => {
      return querySQL(
        `SELECT t.*,
           a.name AS accountName,
           c.name AS customCategoryName, c.icon AS customCategoryIcon, c.type AS customCategoryType
         FROM transactions t
         LEFT JOIN accounts a ON t.accountId = a.id
         LEFT JOIN custom_categories c ON t.customCategoryId = c.id
         WHERE 1=1 ${typeCondition}
         ORDER BY t.date DESC, t.rowid DESC
         LIMIT ? OFFSET ?`,
        [...typeParam, PAGE_SIZE, pageParam * PAGE_SIZE]
      )
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === PAGE_SIZE ? pages.length : undefined,
    initialPageParam: 0,
    staleTime: 0,
  })
}

// ─── Accent normalization helpers ─────────────────────────────────────────────

export function normalizeText(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function accentStripSQL(col) {
  const pairs = [
    ['á','a'],['Á','a'],['é','e'],['É','e'],['í','i'],['Í','i'],
    ['ó','o'],['Ó','o'],['ú','u'],['Ú','u'],['ü','u'],['Ü','u'],
    ['ñ','n'],['Ñ','n'],
  ]
  let expr = col
  for (const [from, to] of pairs) {
    expr = `REPLACE(${expr},'${from}','${to}')`
  }
  return `LOWER(${expr})`
}

// ─── Transaction search (hits SQLite directly — no pagination) ─────────────────

export function useTransactionSearch(text, filters = {}) {
  const { type = 'all', categoryId = null, categoryIsCustom = false, accountId = null, dateFrom = null, dateTo = null } = filters
  const normalized = normalizeText(text)

  const conditions = []
  const params = []

  conditions.push(`(${accentStripSQL('t.description')} LIKE ? OR CAST(t.amount AS TEXT) LIKE ?)`)
  params.push(`%${normalized}%`, `%${text}%`)

  if (type === 'e' || type === 'i') { conditions.push('t.type = ?'); params.push(type) }
  if (categoryId) {
    conditions.push(categoryIsCustom ? 't.customCategoryId = ?' : 't.globalCategoryId = ?')
    params.push(categoryId)
  }
  if (accountId) { conditions.push('t.accountId = ?'); params.push(accountId) }
  if (dateFrom) { conditions.push('t.date >= ?'); params.push(dateFrom) }
  if (dateTo)   { conditions.push('t.date <= ?'); params.push(dateTo) }

  return useQuery({
    queryKey: ['transactionSearch', text, filters],
    queryFn: () => querySQL(
      `SELECT t.*,
         a.name AS accountName,
         c.name AS customCategoryName, c.icon AS customCategoryIcon, c.type AS customCategoryType
       FROM transactions t
       LEFT JOIN accounts a ON t.accountId = a.id
       LEFT JOIN custom_categories c ON t.customCategoryId = c.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.date DESC, t.rowid DESC
       LIMIT 200`,
      params
    ),
    enabled: text.length > 0,
    staleTime: 0,
  })
}

// ─── Filtered transactions (category, date range, sort — no pagination) ────────

export function useFilteredTransactions(filters = {}, { enabled = true } = {}) {
  const {
    type = 'all',
    categoryId = null,
    categoryIsCustom = false,
    accountId = null,
    dateFrom = null,
    dateTo = null,
    sortBy = 'date',
    sortOrder = 'DESC',
  } = filters

  const conditions = ['1=1']
  const params = []

  if (type === 'e' || type === 'i') { conditions.push('t.type = ?'); params.push(type) }
  if (categoryId) {
    conditions.push(categoryIsCustom ? 't.customCategoryId = ?' : 't.globalCategoryId = ?')
    params.push(categoryId)
  }
  if (accountId) { conditions.push('t.accountId = ?'); params.push(accountId) }
  if (dateFrom) { conditions.push('t.date >= ?'); params.push(dateFrom) }
  if (dateTo)   { conditions.push('t.date <= ?'); params.push(dateTo) }

  const orderCol = sortBy === 'amount' ? 'CAST(t.amount AS REAL)' : 't.date'

  return useQuery({
    queryKey: ['filteredTransactions', filters],
    queryFn: () => querySQL(
      `SELECT t.*,
         a.name AS accountName,
         c.name AS customCategoryName, c.icon AS customCategoryIcon, c.type AS customCategoryType
       FROM transactions t
       LEFT JOIN accounts a ON t.accountId = a.id
       LEFT JOIN custom_categories c ON t.customCategoryId = c.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderCol} ${sortOrder}, t.rowid DESC
       LIMIT 500`,
      params
    ),
    enabled,
    staleTime: 0,
  })
}

// ─── Month summary (income + expenses totals) ──────────────────────────────────

export function useMonthSummary(month) {
  return useQuery({
    queryKey: QK.monthSummary(month),
    queryFn: async () => {
      const [year, monthNum] = month.split('-').map(Number)
      const next = monthNum === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(monthNum + 1).padStart(2, '0')}-01`
      const start = `${month}-01`

      const rows = await querySQL(
        `SELECT type, SUM(amount) as total
         FROM transactions
         WHERE date >= ? AND date < ?
         GROUP BY type`,
        [start, next]
      )

      let income = 0, expenses = 0
      for (const row of rows) {
        if (row.type === 'i') income = row.total
        else if (row.type === 'e') expenses = row.total
      }
      return { income, expenses }
    },
    staleTime: 0,
  })
}

// ─── Calendar dots (which dates have transactions in the month) ────────────────

export function useCalendarDots(month) {
  return useQuery({
    queryKey: QK.calendarDots(month),
    queryFn: async () => {
      const [year, monthNum] = month.split('-').map(Number)
      const next = monthNum === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(monthNum + 1).padStart(2, '0')}-01`
      const start = `${month}-01`

      const rows = await querySQL(
        `SELECT date, type FROM transactions
         WHERE date >= ? AND date < ?`,
        [start, next]
      )

      // Build { 'YYYY-MM-DD': { dots: [{key:'income',...},{key:'expense',...}] } }
      const dots = {}
      for (const row of rows) {
        if (!dots[row.date]) dots[row.date] = { dots: [] }
        const existing = dots[row.date].dots
        const key = row.type === 'i' ? 'income' : 'expense'
        if (!existing.some(d => d.key === key)) {
          existing.push(
            row.type === 'i'
              ? { key: 'income', color: Colors.secondary }
              : { key: 'expense', color: Colors.accent }
          )
        }
      }
      return dots
    },
    staleTime: 0,
  })
}

// ─── Pie chart data (category breakdown for a month) ──────────────────────────

export function useMonthCategoryBreakdown(month) {
  return useQuery({
    queryKey: ['monthCategoryBreakdown', month],
    queryFn: async () => {
      const [year, monthNum] = month.split('-').map(Number)
      const next = monthNum === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(monthNum + 1).padStart(2, '0')}-01`
      const start = `${month}-01`

      const rows = await querySQL(
        `SELECT type,
           COALESCE(globalCategoryId, customCategoryId, 'unknown') AS categoryId,
           SUM(amount) as total
         FROM transactions
         WHERE date >= ? AND date < ?
         GROUP BY type, categoryId`,
        [start, next]
      )

      const typeI = {}, typeE = {}
      for (const row of rows) {
        if (row.type === 'i') typeI[row.categoryId] = row.total
        else typeE[row.categoryId] = row.total
      }
      return { typeI, typeE }
    },
    staleTime: 0,
  })
}

// ─── Day transactions ──────────────────────────────────────────────────────────

export function useDayTransactions(date) {
  return useQuery({
    queryKey: QK.dayTransactions(date),
    queryFn: () => querySQL(
      `SELECT t.*,
         a.name AS accountName,
         c.name AS customCategoryName, c.icon AS customCategoryIcon, c.type AS customCategoryType
       FROM transactions t
       LEFT JOIN accounts a ON t.accountId = a.id
       LEFT JOIN custom_categories c ON t.customCategoryId = c.id
       WHERE t.date = ?
       ORDER BY t.rowid DESC`,
      [date]
    ),
    staleTime: 0,
  })
}

// ─── Custom categories ─────────────────────────────────────────────────────────

export function useCustomCategories() {
  return useQuery({
    queryKey: QK.customCategories,
    queryFn: () => querySQL('SELECT * FROM custom_categories ORDER BY rowid ASC'),
    staleTime: Infinity,
  })
}

// ─── Single transaction (for edit screen) ─────────────────────────────────────

export function useTransaction(id) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => queryOneSQL(
      `SELECT t.*,
         a.name AS accountName,
         c.name AS customCategoryName, c.icon AS customCategoryIcon, c.type AS customCategoryType
       FROM transactions t
       LEFT JOIN accounts a ON t.accountId = a.id
       LEFT JOIN custom_categories c ON t.customCategoryId = c.id
       WHERE t.id = ? OR t.backendId = ?`,
      [id, id]
    ),
    enabled: !!id,
    staleTime: 0,
  })
}

// ─── Invalidation helpers ──────────────────────────────────────────────────────

export function useInvalidateAll() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['transactions'] })
    qc.invalidateQueries({ queryKey: ['transactionSearch'] })
    qc.invalidateQueries({ queryKey: ['filteredTransactions'] })
    qc.invalidateQueries({ queryKey: ['monthSummary'] })
    qc.invalidateQueries({ queryKey: ['calendarDots'] })
    qc.invalidateQueries({ queryKey: ['monthCategoryBreakdown'] })
    qc.invalidateQueries({ queryKey: ['dayTransactions'] })
    qc.invalidateQueries({ queryKey: QK.accounts })
  }
}
