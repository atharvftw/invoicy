import { createClient, Client } from "@libsql/client";

let _db: Client | null = null;

export function getDb(): Client {
  if (!_db) {
    _db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return _db;
}

let dbInitialized = false;

export async function initDB() {
  if (dbInitialized) return;
  await getDb().execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      address TEXT,
      phone TEXT,
      created_at TEXT
    )
  `);
  dbInitialized = true;
}
