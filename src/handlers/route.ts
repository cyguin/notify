import { NextResponse } from 'next/server'
import { getNotificationAdapter } from '../di'
import type { NotifyOptions } from '../types'

export interface NotifyHandlerOptions {
  secret?: string
}

function requireAdmin(request: Request, secret?: string): NextResponse | null {
  if (!secret) {
    return NextResponse.json({ error: 'Notify secret is not configured' }, { status: 500 })
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

export function createNotifyHandler(options?: NotifyHandlerOptions) {
  const adapter = getNotificationAdapter()
  const secret = options?.secret

  return {
    async GET(request: Request) {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 })
      }
      const limit = Number(url.searchParams.get('limit') ?? 20)
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const notifications = await adapter.findManyByUser(userId, { limit, offset })
      return NextResponse.json({ notifications })
    },

    async POST(request: Request) {
      const authError = requireAdmin(request, secret)
      if (authError) return authError

      let body: { userId: string; title: string; body: string; href?: string }
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
      }
      const { userId, title, body: notificationBody, href } = body
      if (!userId || !title || !notificationBody) {
        return NextResponse.json({ error: 'userId, title, and body are required' }, { status: 400 })
      }
      const options: NotifyOptions = { title, body: notificationBody, href }
      const notification = await adapter.create({ userId, ...options })
      return NextResponse.json({ notification }, { status: 201 })
    },

    async PATCH(request: Request) {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      const userId = url.searchParams.get('userId')
      if (!id || !userId) {
        return NextResponse.json({ error: 'id and userId are required' }, { status: 400 })
      }
      await adapter.markRead(id, userId)
      return NextResponse.json({ ok: true })
    },
  }
}
