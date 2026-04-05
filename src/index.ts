export { notify } from './notify'
export { getNotificationAdapter, setNotificationAdapter, NOTIFICATION_ADAPTER } from './di'
export { createNotifyHandler } from './handlers/route'
export type { NotificationAdapter, NotificationRecord, NotifyOptions } from './types'
export { createSQLiteAdapter, createPostgresAdapter } from './adapters'

export { NotificationBell } from './components'
export type { Notification, NotificationBellProps } from './components'
