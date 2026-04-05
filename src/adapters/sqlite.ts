import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'
import type { NotificationAdapter, NotificationRecord } from '../types'

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(':memory:')
    _db.pragma('journal_mode = WAL')
    _db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        href        TEXT,
        read_at     INTEGER,
        created_at  INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `)
  }
  return _db
}

function rowToRecord(row: Record<string, unknown>): NotificationRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    body: row.body as string,
    href: row.href as string | undefined,
    readAt: row.read_at as number | undefined,
    createdAt: row.created_at as number,
  }
}

export const SQLiteNotificationAdapter: NotificationAdapter = {
  async create(notification) {
    const db = getDb()
    const id = nanoid()
    const createdAt = Date.now()
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, body, href, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, notification.userId, notification.title, notification.body, notification.href ?? null, createdAt)
    return { id, ...notification, createdAt }
  },

  async findManyByUser(userId, { limit = 20, offset = 0 } = {}) {
    const db = getDb()
    const rows = db.prepare(`
      SELECT id, user_id, title, body, href, read_at, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset) as Record<string, unknown>[]
    return rows.map(rowToRecord)
  },

  async markRead(id, userId) {
    const db = getDb()
    db.prepare(`
      UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ?
    `).run(Date.now(), id, userId)
  },

  async countUnread(userId) {
    const db = getDb()
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL
    `).get(userId) as { count: number }
    return row.count
  },
}

export function createSQLiteAdapter(): NotificationAdapter {
  return SQLiteNotificationAdapter
}
