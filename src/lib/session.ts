export type ChatSession = {
  id: string
  name: string
  expiresAt: number
}

const encoder = new TextEncoder()
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function toBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
}

async function sign(payload: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))
}

export async function createSession(name: string, secret: string): Promise<{ session: ChatSession; value: string }> {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    name,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  }
  const payload = toBase64Url(encoder.encode(JSON.stringify(session)))
  const signature = toBase64Url(await sign(payload, secret))
  return { session, value: `${payload}.${signature}` }
}

export async function readSession(request: Request, secret: string): Promise<ChatSession | null> {
  const value = request.headers
    .get('cookie')
    ?.split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('active_chat_session='))
    ?.slice('active_chat_session='.length)

  if (!value) return null
  const [payload, suppliedSignature] = value.split('.')
  if (!payload || !suppliedSignature) return null

  const expectedSignature = toBase64Url(await sign(payload, secret))
  if (expectedSignature.length !== suppliedSignature.length) return null
  let mismatch = 0
  for (let index = 0; index < expectedSignature.length; index += 1) {
    mismatch |= expectedSignature.charCodeAt(index) ^ suppliedSignature.charCodeAt(index)
  }
  if (mismatch !== 0) return null

  try {
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as ChatSession
    if (
      typeof session.id !== 'string' ||
      typeof session.name !== 'string' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Date.now()
    ) {
      return null
    }
    return session
  } catch {
    return null
  }
}

export function sessionCookie(value: string, request: Request): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `active_chat_session=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`
}

export function expiredSessionCookie(request: Request): string {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return `active_chat_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`
}
