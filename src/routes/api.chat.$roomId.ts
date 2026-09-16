import { createFileRoute } from '@tanstack/react-router'
import '@tanstack/react-start'
import { env } from 'cloudflare:workers'
import { readSession } from '../lib/session'

type Bindings = {
  CHAT_ROOMS: DurableObjectNamespace
  SESSION_SECRET: string
}

function encodeConnection(connection: { id: string; name: string }): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(connection))))
}

export const Route = createFileRoute('/api/chat/$roomId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
          return new Response('Expected a WebSocket upgrade', { status: 426 })
        }
        if (!/^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,98}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(params.roomId)) {
          return new Response('Invalid room name', { status: 400 })
        }

        const bindings = env as unknown as Bindings
        const session = await readSession(request, bindings.SESSION_SECRET)
        if (!session) return new Response('Unauthorized', { status: 401 })

        const room = bindings.CHAT_ROOMS.getByName(params.roomId)
        const forwardedRequest = new Request(request, {
          headers: new Headers(request.headers),
        })
        forwardedRequest.headers.set(
          'x-active-chat-connection',
          encodeConnection({ id: session.id, name: session.name }),
        )
        return room.fetch(forwardedRequest)
      },
    },
  },
})
