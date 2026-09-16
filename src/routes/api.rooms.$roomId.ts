import '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { readSession } from '../lib/session'
import type { ChatRoom } from '../durable-objects/chat-room'

type EncryptedPayload = { ciphertext: string; iv: string }
type Bindings = { CHAT_ROOMS: DurableObjectNamespace<ChatRoom>; SESSION_SECRET: string }

function validRoomId(roomId: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,98}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(roomId)
}

function validBootstrap(value: unknown): value is EncryptedPayload {
  if (!value || typeof value !== 'object') return false
  const payload = value as EncryptedPayload
  return typeof payload.ciphertext === 'string' && payload.ciphertext.length <= 8_000 && typeof payload.iv === 'string' && payload.iv.length <= 32
}

export const Route = createFileRoute('/api/rooms/$roomId')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        if (!validRoomId(params.roomId)) return new Response('Invalid room name', { status: 400 })
        const bindings = env as unknown as Bindings
        if (!await readSession(request, bindings.SESSION_SECRET)) return new Response('Unauthorized', { status: 401 })

        const body = await request.json().catch(() => null) as { bootstrap?: unknown } | null
        if (body?.bootstrap !== undefined && !validBootstrap(body.bootstrap)) {
          return Response.json({ error: 'Invalid encrypted room configuration.' }, { status: 400 })
        }
        const room = bindings.CHAT_ROOMS.getByName(params.roomId)
        const protection = await room.configureRoom(body?.bootstrap ?? null)
        return Response.json({ encrypted: protection.mode === 'encrypted' }, { headers: { 'Cache-Control': 'no-store' } })
      },
    },
  },
})
