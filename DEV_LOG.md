# DEV_LOG.md — @cyguin/notify

## Slice Status

### Slice 1 — Notifications API + Adapters ✅ DONE
- [x] `src/types.ts` — `NotificationRecord`, `NotifyOptions`, `NotificationAdapter` interface
- [x] `src/di.ts` — `NOTIFICATION_ADAPTER` symbol, `setNotificationAdapter`, `getNotificationAdapter`
- [x] `src/notify.ts` — `notify(userId, options)` server function
- [x] `src/adapters/sqlite.ts` — `createSQLiteAdapter` implementing `NotificationAdapter`
- [x] `src/adapters/postgres.ts` — `createPostgresAdapter` implementing `NotificationAdapter`
- [x] `src/handlers/route.ts` — `createNotifyHandler` for `GET`, `POST`, `PATCH`
- [x] `src/index.ts` — Re-exports all public APIs
- [x] Build passes

### Slice 2 — NotificationBell Component + README + Package Config ✅ DONE
- [x] `src/components/NotificationBell.tsx` — Bell with badge, dropdown, polling, mark-read
- [x] `src/components/index.ts` — Re-exports `NotificationBell`
- [x] Updated `src/index.ts` — Re-exports from components
- [x] `package.json` — Name, exports, types, peer deps
- [x] `tsconfig.json` — Standard Next.js package tsconfig
- [x] `tsup.config.ts` — Dual ESM/CJS with all entry points
- [x] `README.md` — Drop-in usage example

## API Endpoints (via createNotifyHandler)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notify?userId=xxx&limit=N` | List notifications for user (newest first) |
| POST | `/api/notify` | Create notification `{userId, title, body, href?}` |
| PATCH | `/api/notify/:id/read?userId=xxx` | Mark notification as read |

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `notify` | function | Server function to trigger a notification |
| `NotificationBell` | component | In-app notification bell with dropdown |
| `createNotifyHandler` | function | API route handler factory |
| `getNotificationAdapter` | function | Get the configured adapter |
| `setNotificationAdapter` | function | Set the notification adapter |
| `NotificationAdapter` | interface | Adapter contract for storage |
| `NOTIFICATION_ADAPTER` | symbol | DI token for the adapter |
| `createSQLiteAdapter` | function | SQLite adapter factory |
| `createPostgresAdapter` | function | Postgres adapter factory |

---

*Last updated: 2026-04-05*
