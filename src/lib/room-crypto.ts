export type EncryptedPayload = {
  ciphertext: string
  iv: string
}

export type RoomCrypto = {
  encrypt: (text: string) => Promise<EncryptedPayload>
  decrypt: (payload: EncryptedPayload) => Promise<string | null>
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function decode(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

export async function createRoomCrypto(roomId: string, password: string): Promise<RoomCrypto> {
  const passwordMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(`active-chat:${roomId}`), iterations: 250_000 },
    passwordMaterial,
    256,
  ))
  const key = await crypto.subtle.importKey('raw', bits, 'AES-GCM', false, ['encrypt', 'decrypt'])

  return {
    async encrypt(text) {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text))
      return { ciphertext: encode(new Uint8Array(ciphertext)), iv: encode(iv) }
    },
    async decrypt(payload) {
      try {
        const iv = decode(payload.iv)
        const plaintext = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
          key,
          decode(payload.ciphertext).buffer as ArrayBuffer,
        )
        return decoder.decode(plaintext)
      } catch {
        return null
      }
    },
  }
}

export async function createEncryptedBootstrap(roomCrypto: RoomCrypto): Promise<EncryptedPayload> {
  return roomCrypto.encrypt(crypto.randomUUID())
}
