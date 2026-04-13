import * as SQLite from 'expo-sqlite'

let db = null

export async function initDB() {
  db = await SQLite.openDatabaseAsync('expensia.db')
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      isPrivacyEnabled INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      backendId TEXT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      isCC INTEGER DEFAULT 0,
      amount REAL DEFAULT 0,
      syncStatus TEXT DEFAULT 'local'
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      backendId TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      accountId TEXT NOT NULL,
      globalCategoryId TEXT,
      customCategoryId TEXT,
      syncStatus TEXT DEFAULT 'local',
      FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_categories (
      id TEXT PRIMARY KEY,
      backendId TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT NOT NULL,
      syncStatus TEXT DEFAULT 'local'
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      operation TEXT NOT NULL,
      localId TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `)
  return db
}

export function getDB() {
  if (!db) throw new Error('DB not initialized. Call initDB() first.')
  return db
}

export async function runSQL(sql, params = []) {
  return getDB().runAsync(sql, params)
}

export async function querySQL(sql, params = []) {
  return getDB().getAllAsync(sql, params)
}

export async function queryOneSQL(sql, params = []) {
  return getDB().getFirstAsync(sql, params)
}
