import { runSQL, querySQL, queryOneSQL } from './db'
import { callAPI, ErrorType } from './apiService'

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

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

// ─── pullFromBackend — upserts backend data into SQLite ───────────────────────
// Called on login and whenever the app comes back to the foreground (AppState active).

export async function pullFromBackend() {

  // 1. Pull accounts
  const { data: accData, errorType: accErr } = await callAPI('/api/accounts', { method: 'GET' })
  if (accErr === ErrorType.NETWORK) return false
  const remoteAccountIds = []
  for (const acc of accData?.accounts ?? []) {
    remoteAccountIds.push(String(acc.id))
    const existing = await queryOneSQL('SELECT id FROM accounts WHERE backendId = ?', [acc.id])
    if (existing) {
      await runSQL(
        `UPDATE accounts SET name = ?, icon = ?, isCC = ?, amount = ?, syncStatus = 'synced' WHERE backendId = ?`,
        [acc.name, acc.icon, acc.isCC ? 1 : 0, acc.amount, acc.id]
      )
    } else {
      await runSQL(
        'INSERT INTO accounts (id, backendId, name, icon, isCC, amount, syncStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [generateId(), acc.id, acc.name, acc.icon, acc.isCC ? 1 : 0, acc.amount, 'synced']
      )
    }
  }
  // Remove accounts deleted on another device
  if (remoteAccountIds.length > 0) {
    const placeholders = remoteAccountIds.map(() => '?').join(', ')
    await runSQL(
      `DELETE FROM accounts WHERE syncStatus = 'synced' AND backendId NOT IN (${placeholders})`,
      remoteAccountIds
    )
  } else {
    await runSQL(`DELETE FROM accounts WHERE syncStatus = 'synced'`)
  }

  // 2. Pull custom categories
  const { data: catData, errorType: catErr } = await callAPI('/api/categories/custom', { method: 'GET' })
  if (catErr === ErrorType.NETWORK) return false
  const remoteCategoryIds = []
  for (const cat of catData?.categories ?? []) {
    remoteCategoryIds.push(String(cat.id))
    const existing = await queryOneSQL('SELECT id FROM custom_categories WHERE backendId = ?', [cat.id])
    if (existing) {
      await runSQL(
        `UPDATE custom_categories SET name = ?, type = ?, icon = ?, syncStatus = 'synced' WHERE backendId = ?`,
        [cat.name, cat.type, cat.icon, cat.id]
      )
    } else {
      await runSQL(
        'INSERT INTO custom_categories (id, backendId, name, type, icon, syncStatus) VALUES (?, ?, ?, ?, ?, ?)',
        [generateId(), cat.id, cat.name, cat.type, cat.icon, 'synced']
      )
    }
  }
  // Remove categories deleted on another device
  if (remoteCategoryIds.length > 0) {
    const placeholders = remoteCategoryIds.map(() => '?').join(', ')
    await runSQL(
      `DELETE FROM custom_categories WHERE syncStatus = 'synced' AND backendId NOT IN (${placeholders})`,
      remoteCategoryIds
    )
  } else {
    await runSQL(`DELETE FROM custom_categories WHERE syncStatus = 'synced'`)
  }

  // 3. Pull transactions per account — avoids depending on idAccount in the response
  //    (deployed backend strips idAccount via formatter; ?accountId filter works in all versions)
  for (const acc of accData?.accounts ?? []) {
    const accRow = await queryOneSQL('SELECT id FROM accounts WHERE backendId = ?', [acc.id])
    if (!accRow) continue

    const remoteTxIds = []
    let page = 0
    const TX_LIMIT = 100
    while (true) {
      const { data: txData, errorType: txErr } = await callAPI(
        `/api/transactions?accountId=${acc.id}&page=${page}&limit=${TX_LIMIT}`,
        { method: 'GET' }
      )
      if (txErr === ErrorType.NETWORK) return false
      const txList = txData?.transactions ?? []

      for (const tx of txList) {
        remoteTxIds.push(String(tx.id))

        // Resolve local custom category id
        // Use relation object as fallback since deployed backend may strip idCustomCategory
        let localCatId = null
        const backendCatId = tx.idCustomCategory ?? tx.customCategory?.id
        if (backendCatId) {
          const catRow = await queryOneSQL('SELECT id FROM custom_categories WHERE backendId = ?', [backendCatId])
          localCatId = catRow?.id ?? null
        }

        // Same fallback for globalCategoryId
        const globalCatId = tx.idGlobalCategory ?? tx.globalCategory?.id ?? null

        // Backend returns ISO datetime ("2025-01-15T00:00:00.000Z") → slice to "YYYY-MM-DD"
        const dateStr = typeof tx.date === 'string' ? tx.date.slice(0, 10) : tx.date

        const existing = await queryOneSQL('SELECT id FROM transactions WHERE backendId = ?', [tx.id])
        if (existing) {
          await runSQL(
            `UPDATE transactions
             SET type = ?, amount = ?, date = ?, description = ?,
                 accountId = ?, globalCategoryId = ?, customCategoryId = ?, syncStatus = 'synced'
             WHERE backendId = ?`,
            [tx.type, tx.amount, dateStr, tx.description ?? null,
             accRow.id, globalCatId, localCatId, tx.id]
          )
        } else {
          await runSQL(
            `INSERT INTO transactions
               (id, backendId, type, amount, date, description, accountId, globalCategoryId, customCategoryId, syncStatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [generateId(), tx.id, tx.type, tx.amount, dateStr,
             tx.description ?? null, accRow.id,
             globalCatId, localCatId, 'synced']
          )
        }
      }

      if (txList.length < TX_LIMIT) break
      page++
    }

    // Remove transactions deleted on another device (only for this account)
    if (remoteTxIds.length > 0) {
      const placeholders = remoteTxIds.map(() => '?').join(', ')
      await runSQL(
        `DELETE FROM transactions WHERE syncStatus = 'synced' AND accountId = ? AND backendId NOT IN (${placeholders})`,
        [accRow.id, ...remoteTxIds]
      )
    } else {
      await runSQL(
        `DELETE FROM transactions WHERE syncStatus = 'synced' AND accountId = ?`,
        [accRow.id]
      )
    }
  }

  return true
}

// ─── pushLocalOnly — uploads items created offline before login ───────────────

async function pushLocalOnly() {

  // 4. Push local-only accounts
  const localAccounts = await querySQL("SELECT * FROM accounts WHERE syncStatus = 'local'")
  for (const acc of localAccounts) {
    const { data, errorType } = await callAPI('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ name: acc.name, icon: acc.icon, isCC: !!acc.isCC, amount: acc.amount }),
    })
    if (errorType === ErrorType.NETWORK) return false
    if (data?.account) await markSynced('account', acc.id, data.account.id)
  }

  // 5. Push local-only custom categories
  const localCategories = await querySQL("SELECT * FROM custom_categories WHERE syncStatus = 'local'")
  for (const cat of localCategories) {
    const { data, errorType } = await callAPI('/api/categories/custom', {
      method: 'POST',
      body: JSON.stringify({ name: cat.name, type: cat.type, icon: cat.icon }),
    })
    if (errorType === ErrorType.NETWORK) return false
    if (data?.category) await markSynced('customCategory', cat.id, data.category.id)
  }

  // 6. Push local-only transactions
  const localTransactions = await querySQL(
    "SELECT * FROM transactions WHERE syncStatus = 'local' ORDER BY date ASC"
  )
  for (const tx of localTransactions) {
    const accountRow = await queryOneSQL('SELECT backendId FROM accounts WHERE id = ?', [tx.accountId])
    if (!accountRow?.backendId) continue

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
    if (data?.transaction) await markSynced('transaction', tx.id, data.transaction.id)
  }

  return true
}

// ─── initialSync — runs on first login ────────────────────────────────────────
// Strategy: PULL first (backend → SQLite), then PUSH (SQLite local-only → backend).

export async function initialSync() {
  const pulled = await pullFromBackend()
  if (!pulled) return false
  await pushLocalOnly()
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
