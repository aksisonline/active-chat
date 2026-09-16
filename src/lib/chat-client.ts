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
  content: string
  timestamp: number
}

export type ChatEvent =
  | ChatMessage
  | { type: 'typing'; userId: string; username: string; isTyping: boolean }
  | { type: 'ready'; connectionId: string }

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

export function chatSocket(roomId: string): WebSocket {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return new WebSocket(`${protocol}//${window.location.host}/api/chat/${encodeURIComponent(roomId)}`)
}
