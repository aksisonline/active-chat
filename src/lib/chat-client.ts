export type Session = {
  id: string
  name: string
  expiresAt: number
}

export type ChatMessage = {
  type: 'message'
  id: string
  userId: string
  username: string
  content?: string
  encrypted?: { ciphertext: string; iv: string }
  timestamp: number
}

export type ChatEvent =
  | ChatMessage
  | { type: 'typing'; userId: string; username: string; isTyping: boolean; content?: string; encrypted?: { ciphertext: string; iv: string } }
  | { type: 'room'; encrypted: boolean; bootstrap?: { ciphertext: string; iv: string } }
  | { type: 'system'; id: string; content: string; timestamp: number }
  | { type: 'presence'; online: number }

export async function getSession(): Promise<Session | null> {
  const response = await fetch('/api/session', { credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) return null
  return (await response.json() as { session: Session | null }).session
}

export async function startSession(name: string): Promise<Session> {
  const response = await fetch('/api/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const body = await response.json() as { session?: Session; error?: string }
  if (!response.ok || !body.session) throw new Error(body.error ?? 'Could not start your session.')
  return body.session
}

export async function endSession(): Promise<void> {
  await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' })
}

export async function updateSessionName(name: string): Promise<Session> {
  const response = await fetch('/api/session', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const body = await response.json() as { session?: Session; error?: string }
  if (!response.ok || !body.session) throw new Error(body.error ?? 'Could not update your name.')
  return body.session
}

export async function configureRoom(roomId: string, bootstrap?: { ciphertext: string; iv: string }): Promise<{ encrypted: boolean }> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(roomId)}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bootstrap ? { bootstrap } : {}),
  })
  const body = await response.json() as { encrypted?: boolean; error?: string }
  if (!response.ok || typeof body.encrypted !== 'boolean') throw new Error(body.error ?? 'Could not configure the room.')
  return { encrypted: body.encrypted }
}

export function chatSocket(roomId: string): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return new WebSocket(`${protocol}//${window.location.host}/api/chat/${encodeURIComponent(roomId)}`)
}
