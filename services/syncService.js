import { runSQL, querySQL, queryOneSQL } from './db'
import { callAPI, ErrorType } from './apiService'

// ─── Queue helpers ────────────────────────────────────────────────────────────

async function enqueue(entity, operation, localId, payload) {
  await runSQL(
    `INSERT INTO sync_queue (entity, operation, localId, payload, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [entity, operation, localId, JSON.stringify(payload), new Date().toISOString()]
  )
}

async function dequeue(id) {
  await runSQL('DELETE FROM sync_queue WHERE id = ?', [id])
}

async function markFailed(entity, localId) {
  const table = entityTable(entity)
  await runSQL(`UPDATE ${table} SET syncStatus = 'failed' WHERE id = ?`, [localId])
}

async function markSynced(entity, localId, backendId) {
  const table = entityTable(entity)
  await runSQL(
    `UPDATE ${table} SET syncStatus = 'synced', backendId = ? WHERE id = ?`,
    [backendId, localId]
  )
}

function entityTable(entity) {
  const map = {
    account: 'accounts',
    transaction: 'transactions',
    customCategory: 'custom_categories',
  }
  return map[entity]
}

// ─── API endpoint per entity/operation ────────────────────────────────────────

function resolveEndpoint(entity, operation, payload, backendId) {
  const endpoints = {
    account: {
      CREATE: ['/api/accounts', 'POST'],
      UPDATE: [`/api/accounts/${backendId}`, 'PATCH'],
      DELETE: [`/api/accounts/${backendId}`, 'DELETE'],
    },
    transaction: {
      CREATE: ['/api/transactions', 'POST'],
      UPDATE: [`/api/transactions/${backendId}`, 'PATCH'],
      DELETE: [`/api/transactions/${backendId}`, 'DELETE'],
    },
    customCategory: {
      CREATE: ['/api/categories/custom', 'POST'],
      UPDATE: [`/api/categories/custom/${backendId}`, 'PATCH'],
      DELETE: [`/api/categories/custom/${backendId}`, 'DELETE'],
    },
  }
  return endpoints[entity]?.[operation]
}

// ─── processQueue — runs on network recovery ──────────────────────────────────

export async function processQueue() {
  const items = await querySQL(
    'SELECT * FROM sync_queue ORDER BY createdAt ASC'
  )

  for (const item of items) {
    const payload = JSON.parse(item.payload)
    const table = entityTable(item.entity)

    // Get current backendId for UPDATE/DELETE
    const row = await queryOneSQL(`SELECT backendId FROM ${table} WHERE id = ?`, [item.localId])
    const backendId = row?.backendId

    // For UPDATE/DELETE we need a backendId — skip if still not synced
    if ((item.operation === 'UPDATE' || item.operation === 'DELETE') && !backendId) continue

    const resolved = resolveEndpoint(item.entity, item.operation, payload, backendId)
    if (!resolved) continue

    const [endpoint, method] = resolved
    const { data, errorType } = await callAPI(endpoint, {
      method,
      body: item.operation !== 'DELETE' ? JSON.stringify(payload) : undefined,
    })

    if (errorType === ErrorType.NETWORK) {
      // No internet — stop processing, will retry on next reconnection
      break
    }

    if (errorType === ErrorType.CLIENT) {
      // Backend rejected — mark failed, remove from queue, don't retry
      await markFailed(item.entity, item.localId)
      await dequeue(item.id)
      continue
    }

    if (errorType === ErrorType.SERVER) {
      // Server error — skip, keep in queue, try again later
      continue
    }

    // Success
    const newBackendId = data?.[item.entity]?.id ?? data?.account?.id ?? data?.transaction?.id ?? data?.category?.id
    await markSynced(item.entity, item.localId, newBackendId ?? backendId)
    await dequeue(item.id)
  }
}

// ─── initialSync — runs on first login ────────────────────────────────────────

export async function initialSync() {
  // 1. Accounts
  const accounts = await querySQL('SELECT * FROM accounts')
  for (const acc of accounts) {
    const { data, errorType } = await callAPI('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ name: acc.name, icon: acc.icon, isCC: !!acc.isCC, amount: acc.amount }),
    })
    if (errorType === ErrorType.NETWORK) return false
    if (data?.account) {
      await markSynced('account', acc.id, data.account.id)
    }
  }

  // 2. Custom Categories
  const categories = await querySQL('SELECT * FROM custom_categories')
  for (const cat of categories) {
    const { data, errorType } = await callAPI('/api/categories/custom', {
      method: 'POST',
      body: JSON.stringify({ name: cat.name, type: cat.type, icon: cat.icon }),
    })
    if (errorType === ErrorType.NETWORK) return false
    if (data?.category) {
      await markSynced('customCategory', cat.id, data.category.id)
    }
  }

  // 3. Transactions
  const transactions = await querySQL('SELECT * FROM transactions ORDER BY date ASC')
  for (const tx of transactions) {
    const accountRow = await queryOneSQL('SELECT backendId FROM accounts WHERE id = ?', [tx.accountId])
    if (!accountRow?.backendId) continue // account didn't sync, skip

    let customCategoryBackendId = null
    if (tx.customCategoryId) {
      const catRow = await queryOneSQL('SELECT backendId FROM custom_categories WHERE id = ?', [tx.customCategoryId])
      customCategoryBackendId = catRow?.backendId ?? null
    }

    const { data, errorType } = await callAPI('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        type: tx.type,
        amount: tx.amount,
        date: tx.date,
        description: tx.description,
        idAccount: accountRow.backendId,
        idCustomCategory: customCategoryBackendId,
        idGlobalCategory: tx.globalCategoryId ?? null,
      }),
    })
    if (errorType === ErrorType.NETWORK) return false
    if (data?.transaction) {
      await markSynced('transaction', tx.id, data.transaction.id)
    }
  }

  return true
}

// ─── Sync a single operation (called after each CRUD action) ──────────────────

export async function syncOne(entity, operation, localId, payload, isOnline) {
  if (!isOnline) {
    await enqueue(entity, operation, localId, payload)
    return ErrorType.NETWORK
  }

  const table = entityTable(entity)
  const row = await queryOneSQL(`SELECT backendId FROM ${table} WHERE id = ?`, [localId])
  const backendId = row?.backendId

  if ((operation === 'UPDATE' || operation === 'DELETE') && !backendId) {
    await enqueue(entity, operation, localId, payload)
    return ErrorType.NETWORK
  }

  const resolved = resolveEndpoint(entity, operation, payload, backendId)
  if (!resolved) return ErrorType.CLIENT

  const [endpoint, method] = resolved
  const { data, errorType } = await callAPI(endpoint, {
    method,
    body: operation !== 'DELETE' ? JSON.stringify(payload) : undefined,
  })

  if (errorType === null) {
    const newBackendId = data?.account?.id ?? data?.transaction?.id ?? data?.category?.id
    await markSynced(entity, localId, newBackendId ?? backendId)
  } else if (errorType === ErrorType.NETWORK || errorType === ErrorType.SERVER) {
    await enqueue(entity, operation, localId, payload)
  } else if (errorType === ErrorType.CLIENT) {
    await markFailed(entity, localId)
  }

  return errorType
}
