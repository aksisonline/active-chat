import { DurableObject } from 'cloudflare:workers'

type Connection = {
  id: string
  name: string
}

type ClientEvent =
  | { type: 'message'; content: string }
  | { type: 'typing'; isTyping: boolean; content: string }

export class ChatRoom extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 })
    if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected a WebSocket upgrade', { status: 426 })
    }

    const connection = this.connectionFromRequest(request)
    if (!connection) return new Response('Unauthorized', { status: 401 })

    const [client, server] = Object.values(new WebSocketPair())
    server.serializeAttachment(connection)
    this.ctx.acceptWebSocket(server)
    server.send(JSON.stringify({ type: 'ready', connectionId: connection.id }))

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(socket: WebSocket, incoming: string | ArrayBuffer): Promise<void> {
    const connection = socket.deserializeAttachment() as Connection | null
    if (!connection) {
      socket.close(1008, 'Missing session')
      return
    }

    const raw = typeof incoming === 'string' ? incoming : new TextDecoder().decode(incoming)
    if (raw.length > 4_096) {
      socket.close(1009, 'Message is too large')
      return
    }

    let event: ClientEvent
    try {
      event = JSON.parse(raw) as ClientEvent
    } catch {
      return
    }

    if (event.type === 'message') {
      const content = typeof event.content === 'string' ? event.content.trim() : ''
      if (!content) return
      this.broadcast({
        type: 'message',
        id: crypto.randomUUID(),
        userId: connection.id,
        username: connection.name,
        content,
        timestamp: Date.now(),
      })
      return
    }

    if (event.type === 'typing' && typeof event.isTyping === 'boolean') {
      const content = typeof event.content === 'string' ? event.content.slice(0, 4_000) : ''
      this.broadcast({
        type: 'typing',
        userId: connection.id,
        username: connection.name,
        isTyping: event.isTyping && Boolean(content.trim()),
        content,
      })
    }
  }

  webSocketClose(socket: WebSocket, code: number, reason: string): void {
    socket.close(code, reason)
  }

  private connectionFromRequest(request: Request): Connection | null {
    const encoded = request.headers.get('x-active-chat-connection')
    if (!encoded) return null
    try {
      const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0))
      const connection = JSON.parse(new TextDecoder().decode(bytes)) as Connection
      if (typeof connection.id !== 'string' || typeof connection.name !== 'string') return null
      return connection
    } catch {
      return null
    }
  }

  private broadcast(event: object): void {
    const message = JSON.stringify(event)
    for (const socket of this.ctx.getWebSockets()) socket.send(message)
  }
}
