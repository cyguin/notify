import { nanoid } from 'nanoid'
import type { NotificationAdapter, NotificationRecord } from '../types'

export function createPostgresAdapter(connectionString: string): NotificationAdapter {
  const pool = (globalThis as Record<string, unknown>).__cyguin_postgres_pool as {
    query: (sql: string, params: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>
  } | undefined

  const sql = pool
    ? (q: string, p: unknown[]) => pool.query(q, p).then(r => r.rows)
    : async (_q: string, _p: unknown[]) => { throw new Error('Postgres pool not initialized') }

  return {
    async create(notification) {
      const id = nanoid()
      const createdAt = Date.now()
      await sql(
        `INSERT INTO notifications (id, user_id, title, body, href, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, notification.userId, notification.title, notification.body, notification.href ?? null, createdAt]
      )
      return { id, ...notification, createdAt }
    },

    async findManyByUser(userId, { limit = 20, offset = 0 } = {}) {
      const rows = await sql(
        `SELECT id, user_id, title, body, href, read_at, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      )
      return rows.map((row) => ({
        id: row.id as string,
        userId: row.user_id as string,
        title: row.title as string,
        body: row.body as string,
        href: row.href as string | undefined,
        readAt: row.read_at as number | undefined,
        createdAt: row.created_at as number,
      }))
    },

    async markRead(id, userId) {
      await sql(
        `UPDATE notifications SET read_at = $1 WHERE id = $2 AND user_id = $3`,
        [Date.now(), id, userId]
      )
    },

    async countUnread(userId) {
      const rows = await sql(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
        [userId]
      )
      return Number(rows[0]?.count ?? 0)
    },
  }
}
