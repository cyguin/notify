import { getNotificationAdapter } from './di'
import type { NotifyOptions } from './types'

export async function notify(userId: string, options: NotifyOptions): Promise<void> {
  const adapter = getNotificationAdapter()
  await adapter.create({ userId, ...options })
}
