export interface NotificationRecord {
  id: string
  userId: string
  title: string
  body: string
  href?: string
  readAt?: number
  createdAt: number
}

export interface NotifyOptions {
  title: string
  body: string
  href?: string
}

export interface NotificationAdapter {
  create(notification: Omit<NotificationRecord, 'id' | 'createdAt'>): Promise<NotificationRecord>
  findManyByUser(userId: string, options?: { limit?: number; offset?: number }): Promise<NotificationRecord[]>
  markRead(id: string, userId: string): Promise<void>
  countUnread(userId: string): Promise<number>
}
