import { DurableObject } from 'cloudflare:workers'

type EncryptedPayload = { ciphertext: string; iv: string }
type RoomProtection = { mode: 'open' } | { mode: 'encrypted'; bootstrap: EncryptedPayload }
type Connection = { id: string; name: string; joined?: boolean }
type ClientEvent =
  | { type: 'join' }
  | { type: 'message'; content?: string; encrypted?: EncryptedPayload }
  | { type: 'typing'; isTyping: boolean; content?: string; encrypted?: EncryptedPayload }

export class ChatRoom extends DurableObject {
  async configureRoom(bootstrap: EncryptedPayload | null): Promise<RoomProtection> {
    const existing = await this.ctx.storage.get<RoomProtection>('protection')
    if (existing) return existing

    const protection: RoomProtection = bootstrap ? { mode: 'encrypted', bootstrap } : { mode: 'open' }
    await this.ctx.storage.put('protection', protection)
    return protection
  }

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
    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(socket: WebSocket, incoming: string | ArrayBuffer): Promise<void> {
    const connection = socket.deserializeAttachment() as Connection | null
    if (!connection) return socket.close(1008, 'Missing session')

    const raw = typeof incoming === 'string' ? incoming : new TextDecoder().decode(incoming)
    if (raw.length > 8_192) return socket.close(1009, 'Message is too large')

    let event: ClientEvent
    try {
      event = JSON.parse(raw) as ClientEvent
    } catch {
      return
    }

    const protection = await this.ctx.storage.get<RoomProtection>('protection') ?? await this.configureRoom(null)
    if (event.type === 'join') {
      const entered = !connection.joined
      connection.joined = true
      socket.serializeAttachment(connection)
      socket.send(JSON.stringify({
        type: 'room',
        encrypted: protection.mode === 'encrypted',
        bootstrap: protection.mode === 'encrypted' ? protection.bootstrap : undefined,
      }))
      if (entered) {
        this.broadcast({
          type: 'system',
          id: crypto.randomUUID(),
          content: `${connection.name} has entered the room`,
          timestamp: Date.now(),
        })
        this.broadcast({ type: 'presence', online: this.onlineCount() })
      }
      return
    }
    if (!connection.joined) return socket.close(1008, 'Join the room first')

    if (event.type === 'message') {
      if (protection.mode === 'encrypted') {
        if (!this.isEncryptedPayload(event.encrypted)) return
        this.broadcast({ type: 'message', id: crypto.randomUUID(), userId: connection.id, username: connection.name, encrypted: event.encrypted, timestamp: Date.now() })
      } else {
        const content = typeof event.content === 'string' ? event.content.trim() : ''
        if (!content) return
        this.broadcast({ type: 'message', id: crypto.randomUUID(), userId: connection.id, username: connection.name, content, timestamp: Date.now() })
      }
      return
    }

    if (event.type === 'typing' && typeof event.isTyping === 'boolean') {
      if (protection.mode === 'encrypted') {
        if (!event.isTyping || this.isEncryptedPayload(event.encrypted)) {
          this.broadcast({ type: 'typing', userId: connection.id, username: connection.name, isTyping: event.isTyping, encrypted: event.encrypted })
        }
      } else {
        const content = typeof event.content === 'string' ? event.content.slice(0, 4_000) : ''
        this.broadcast({ type: 'typing', userId: connection.id, username: connection.name, isTyping: event.isTyping && Boolean(content.trim()), content })
      }
    }
  }

  webSocketClose(socket: WebSocket, code: number, reason: string): void {
    const connection = socket.deserializeAttachment() as Connection | null
    if (connection?.joined) {
      this.broadcast({
        type: 'system',
        id: crypto.randomUUID(),
        content: `${connection.name} has exited the room`,
        timestamp: Date.now(),
      })
      this.broadcast({ type: 'presence', online: this.onlineCount(socket) })
    }
    socket.close(code, reason)
  }

  private connectionFromRequest(request: Request): Connection | null {
    const encoded = request.headers.get('x-active-chat-connection')
    if (!encoded) return null
    try {
      const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0))
      const connection = JSON.parse(new TextDecoder().decode(bytes)) as Connection
      return typeof connection.id === 'string' && typeof connection.name === 'string' ? connection : null
    } catch {
      return null
    }
  }

  private isEncryptedPayload(value: unknown): value is EncryptedPayload {
    if (!value || typeof value !== 'object') return false
    const payload = value as EncryptedPayload
    return typeof payload.ciphertext === 'string' && payload.ciphertext.length <= 8_000 && typeof payload.iv === 'string' && payload.iv.length <= 32
  }

  private broadcast(event: object): void {
    const message = JSON.stringify(event)
    for (const socket of this.ctx.getWebSockets()) socket.send(message)
  }

  private onlineCount(excluding?: WebSocket): number {
    return this.ctx.getWebSockets().filter((socket) => {
      if (socket === excluding) return false
      return (socket.deserializeAttachment() as Connection | null)?.joined
    }).length
  }
}
