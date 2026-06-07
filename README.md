# @cyguin/notify

Server-triggered in-app notifications for Next.js. Drop in the API route, add the bell component, and fire notifications from any server code.

## Install

```bash
npm install @cyguin/notify
```

## Setup

### 1. Create the API route

`app/api/notify/[...cyguin]/route.ts`:

```ts
import { createNotifyHandler } from '@cyguin/notify/next';
import Database from 'better-sqlite3';
import { createSQLiteAdapter } from '@cyguin/notify/adapters/sqlite';

const db = new Database('notify.db');
db.pragma('journal_mode = WAL');
const adapter = createSQLiteAdapter(db);

const handler = createNotifyHandler({
  adapter,
  secret: process.env.NOTIFY_SECRET,
});

export { handler as GET, handler as POST, handler as PATCH };
```

### 2. Run migrations

```sql
CREATE TABLE notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  href        TEXT,
  read_at     INTEGER,
  created_at  INTEGER NOT NULL
);
```

### 3. Configure the adapter at startup

```ts
import { setNotificationAdapter } from '@cyguin/notify';
import { createSQLiteAdapter } from '@cyguin/notify/adapters/sqlite';

const adapter = createSQLiteAdapter(db);
setNotificationAdapter(adapter);
```

### 4. Set the internal API secret

```bash
NOTIFY_SECRET=change-me
```

`POST` is admin-only and requires `Authorization: Bearer $NOTIFY_SECRET`. `GET` and `PATCH` are callable by the widget — pair with your own auth so users can only read/update their own notifications.

### 5. Trigger notifications from server code

```ts
import { notify } from '@cyguin/notify';

// In a server action, API route, or background job:
await notify(userId, {
  title: 'Export ready',
  body: 'Your data export is ready to download.',
  href: '/exports/123',
});
```

### 6. Add the notification bell

```tsx
import { NotificationBell } from '@cyguin/notify/react';

export default function Header({ user }: { user: { id: string } }) {
  return (
    <header>
      <nav>...</nav>
      <NotificationBell
        userId={user.id}
        theme="dark"
        pollInterval={30000}
        maxVisible={10}
        onToggle={(open) => console.log('Dropdown:', open)}
      />
    </header>
  );
}
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notify?userId=xxx&limit=N` | List notifications for user |
| POST | `/api/notify` | Create notification (internal, requires Bearer token) |
| PATCH | `/api/notify/:id/read?userId=xxx` | Mark notification as read |

## NotificationBell Props

| Prop | Default | Description |
|------|---------|-------------|
| `userId` | — | User ID to fetch notifications for |
| `theme` | `'dark'` | Visual theme. `'light'` switches to light mode |
| `pollInterval` | `30000` | Polling interval in ms. Set to `0` to disable |
| `maxVisible` | `10` | Max notifications to show in dropdown |
| `className` | `''` | CSS class for the root element |
| `onToggle` | — | Callback when dropdown opens/closes |

## Theming

The bell defaults to dark. Use `--cyguin-*` CSS variables on `.cyguin-notify-bell` to customize:

```css
.cyguin-notify-bell {
  --cyguin-bg: #ffffff;
  --cyguin-fg: #0a0a0a;
  --cyguin-accent: #f5a800;
  --cyguin-border: #e5e5e5;
  --cyguin-radius: 6px;
  --cyguin-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
```

The dark theme sets these automatically on `[data-theme="dark"]`:

```css
.cyguin-notify-bell[data-theme="dark"] {
  --cyguin-bg: #0a0a0a;
  --cyguin-bg-subtle: #1a1a1a;
  --cyguin-border: #2a2a2a;
  --cyguin-fg: #f5f5f5;
  --cyguin-shadow: 0 1px 4px rgba(0,0,0,0.4);
}
```

## Postgres Setup

```ts
import { createNotifyHandler } from '@cyguin/notify/next';
import postgres from 'postgres';
import { createPostgresAdapter } from '@cyguin/notify/adapters/postgres';

const sql = postgres(process.env.DATABASE_URL!);
const adapter = createPostgresAdapter(sql);

const handler = createNotifyHandler({
  adapter,
  secret: process.env.NOTIFY_SECRET,
});

export { handler as GET, handler as POST, handler as PATCH };
```

## License

MIT
