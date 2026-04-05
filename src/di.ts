import type { NotificationAdapter } from './types'

export const NOTIFICATION_ADAPTER = Symbol.for('@cyguin/notify/NotificationAdapter')

let _adapter: NotificationAdapter | null = null

export function setNotificationAdapter(adapter: NotificationAdapter): void {
  _adapter = adapter
}

export function getNotificationAdapter(): NotificationAdapter {
  if (!_adapter) {
    throw new Error(
      '[@cyguin/notify] Notification adapter not set. ' +
      'Call setNotificationAdapter() before using notify().'
    )
  }
  return _adapter
}
