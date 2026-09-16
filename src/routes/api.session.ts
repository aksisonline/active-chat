import { createFileRoute } from '@tanstack/react-router'
import '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import {
  createSession,
  expiredSessionCookie,
  readSession,
  sessionCookie,
  updateSessionName,
} from '../lib/session'

type Bindings = { SESSION_SECRET: string }

function secret(): string {
  const value = (env as unknown as Bindings).SESSION_SECRET
  if (!value) throw new Error('SESSION_SECRET is not configured')
  return value
}

export const Route = createFileRoute('/api/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await readSession(request, secret())
        return Response.json({ session })
      },
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as { name?: unknown } | null
        const name = typeof body?.name === 'string' ? body.name.trim().replaceAll(/\s+/g, ' ') : ''
        if (!name || name.length > 50) {
          return Response.json({ error: 'Enter a display name of 50 characters or fewer.' }, { status: 400 })
        }

        const { session, value } = await createSession(name, secret())
        return Response.json(
          { session },
          {
            headers: {
              'Cache-Control': 'no-store',
              'Set-Cookie': sessionCookie(value, request),
            },
          },
        )
      },
      DELETE: async ({ request }) =>
        Response.json(
          { ok: true },
          {
            headers: {
              'Cache-Control': 'no-store',
              'Set-Cookie': expiredSessionCookie(request),
            },
          },
        ),
      PATCH: async ({ request }) => {
        const existing = await readSession(request, secret())
        if (!existing) return new Response('Unauthorized', { status: 401 })
        const body = (await request.json().catch(() => null)) as { name?: unknown } | null
        const name = typeof body?.name === 'string' ? body.name.trim().replaceAll(/\s+/g, ' ') : ''
        if (!name || name.length > 50) {
          return Response.json({ error: 'Enter a display name of 50 characters or fewer.' }, { status: 400 })
        }
        const { session, value } = await updateSessionName(existing, name, secret())
        return Response.json({ session }, { headers: { 'Cache-Control': 'no-store', 'Set-Cookie': sessionCookie(value, request) } })
      },
    },
  },
})
