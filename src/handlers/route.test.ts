import { describe, expect, it, vi } from 'vitest';
import { createNotifyHandler } from './route';
import { setNotificationAdapter } from '../di';
import type { NotificationAdapter } from '../types';

function adapter(): NotificationAdapter {
  return {
    create: vi.fn().mockResolvedValue({
      id: 'note_1',
      userId: 'user_1',
      title: 'Heads up',
      body: 'Message',
      createdAt: Date.now(),
    }),
    findManyByUser: vi.fn().mockResolvedValue([]),
    markRead: vi.fn().mockResolvedValue(undefined),
    countUnread: vi.fn().mockResolvedValue(0),
  };
}

describe('createNotifyHandler auth', () => {
  it('fails closed for notification creation without a secret', async () => {
    const notifyAdapter = adapter();
    setNotificationAdapter(notifyAdapter);
    const handler = createNotifyHandler();

    const response = await handler.POST(
      new Request('https://example.com/api/notify', {
        method: 'POST',
        body: JSON.stringify({ userId: 'user_1', title: 'Title', body: 'Body' }),
      })
    );

    expect(response.status).toBe(500);
    expect(notifyAdapter.create).not.toHaveBeenCalled();
  });

  it('requires the configured bearer token for internal notification creation', async () => {
    const notifyAdapter = adapter();
    setNotificationAdapter(notifyAdapter);
    const handler = createNotifyHandler({ secret: 'notify-secret' });

    const response = await handler.POST(
      new Request('https://example.com/api/notify', {
        method: 'POST',
        headers: { authorization: 'Bearer wrong' },
        body: JSON.stringify({ userId: 'user_1', title: 'Title', body: 'Body' }),
      })
    );

    expect(response.status).toBe(401);
    expect(notifyAdapter.create).not.toHaveBeenCalled();
  });

  it('allows the widget to mark a notification read without the internal secret', async () => {
    const notifyAdapter = adapter();
    setNotificationAdapter(notifyAdapter);
    const handler = createNotifyHandler({ secret: 'notify-secret' });

    const response = await handler.PATCH(
      new Request('https://example.com/api/notify?id=note_1&userId=user_1', {
        method: 'PATCH',
      })
    );

    expect(response.status).toBe(200);
    expect(notifyAdapter.markRead).toHaveBeenCalledWith('note_1', 'user_1');
  });
});
