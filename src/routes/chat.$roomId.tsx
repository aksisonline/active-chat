import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Copy, KeyRound, LoaderCircle, Pencil, SendHorizontal, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { chatSocket, getSession, type ChatEvent, type ChatMessage, type Session } from '../lib/chat-client'
import { ThemeSwitcher } from '../components/theme-switcher'
import { createRoomCrypto, type RoomCrypto } from '../lib/room-crypto'

export const Route = createFileRoute('/chat/$roomId')({
  component: ChatRoom,
})

type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'offline'
type DisplayMessage = ChatMessage | { type: 'system'; id: string; content: string; timestamp: number }

function useChatViewport() {
  const [height, setHeight] = useState<number | null>(null)
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    const viewport = window.visualViewport
    const update = () => {
      const nextHeight = Math.round(viewport?.height ?? window.innerHeight)
      setHeight(nextHeight)
      setKeyboardOpen(window.innerHeight - nextHeight > 120)
    }

    update()
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      viewport?.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return { height, keyboardOpen }
}

function ChatRoom() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [typing, setTyping] = useState<Map<string, { name: string; content: string }>>(new Map())
  const [draft, setDraft] = useState('')
  const [connection, setConnection] = useState<ConnectionState>('connecting')
  const [roomPassword, setRoomPassword] = useState(() => typeof window === 'undefined' ? '' : sessionStorage.getItem(`active-chat:room-password:${roomId}`) ?? '')
  const [passwordInput, setPasswordInput] = useState('')
  const [roomAccess, setRoomAccess] = useState<{ encrypted: boolean; canSend: boolean } | null>(null)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const socketRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<number | null>(null)
  const typingRef = useRef<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const roomCryptoRef = useRef<RoomCrypto | null>(null)
  const { height: viewportHeight, keyboardOpen } = useChatViewport()

  useEffect(() => {
    let active = true
    void getSession().then((current) => {
      if (!active) return
      if (!current) {
        void navigate({ to: '/', search: { room: undefined } })
        return
      }
      setSession(current)
    })
    return () => { active = false }
  }, [navigate])

  useEffect(() => {
    let active = true
    roomCryptoRef.current = null
    if (!roomPassword) return
    void createRoomCrypto(roomId, roomPassword).then((roomCrypto) => {
      if (active) roomCryptoRef.current = roomCrypto
    })
    return () => { active = false }
  }, [roomId, roomPassword])

  useEffect(() => {
    if (!session) return
    let active = true
    let attempts = 0

    const connect = () => {
      if (!active) return
      setConnection(attempts === 0 ? 'connecting' : 'reconnecting')
      setRoomAccess(null)
      const socket = chatSocket(roomId)
      socketRef.current = socket
      socket.onopen = () => {
        attempts = 0
        setConnection('connected')
        void (async () => {
          const roomCrypto = roomPassword ? await createRoomCrypto(roomId, roomPassword) : null
          if (active && socket.readyState === WebSocket.OPEN) {
            roomCryptoRef.current = roomCrypto
            socket.send(JSON.stringify({ type: 'join' }))
          }
        })()
      }
      socket.onmessage = (event) => {
        let payload: ChatEvent
        try {
          payload = JSON.parse(event.data) as ChatEvent
        } catch {
          return
        }
        if (payload.type === 'room') {
          void (async () => {
            const canSend = !payload.encrypted || Boolean(payload.bootstrap && roomCryptoRef.current && await roomCryptoRef.current.decrypt(payload.bootstrap))
            if (active) setRoomAccess({ encrypted: payload.encrypted, canSend })
          })()
        }
        if (payload.type === 'presence') {
          setOnlineCount(payload.online)
        }
        if (payload.type === 'system') {
          setMessages((current) => current.some((item) => item.id === payload.id) ? current : [...current, payload])
        }
        if (payload.type === 'message') {
          void (async () => {
            const content = payload.encrypted
              ? await roomCryptoRef.current?.decrypt(payload.encrypted) ?? 'Encrypted message — password does not match.'
              : payload.content ?? ''
            const message = { ...payload, content }
            if (active) setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
          })()
        }
        if (payload.type === 'typing' && payload.userId !== session.id) {
          void (async () => {
            const content = payload.encrypted
              ? await roomCryptoRef.current?.decrypt(payload.encrypted) ?? 'Encrypted typing…'
              : payload.content ?? ''
            if (!active) return
            setTyping((current) => {
              const next = new Map(current)
              if (payload.isTyping) next.set(payload.userId, { name: payload.username, content })
              else next.delete(payload.userId)
              return next
            })
          })()
        }
      }
      socket.onclose = () => {
        if (!active) return
        setConnection('offline')
        attempts += 1
        retryRef.current = window.setTimeout(connect, Math.min(1_000 * 2 ** Math.min(attempts, 4), 10_000))
      }
      socket.onerror = () => socket.close()
    }

    connect()
    return () => {
      active = false
      if (retryRef.current) window.clearTimeout(retryRef.current)
      socketRef.current?.close(1000, 'Leaving room')
      if (typingRef.current) window.clearTimeout(typingRef.current)
    }
  }, [roomId, roomPassword, session])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    if (!keyboardOpen) return
    const frame = window.requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [keyboardOpen])

  async function send(event: React.FormEvent) {
    event.preventDefault()
    const content = draft.trim()
    const socket = socketRef.current
    if (!content || socket?.readyState !== WebSocket.OPEN || !roomAccess?.canSend) return
    if (roomAccess?.encrypted) {
      const roomCrypto = roomCryptoRef.current
      if (!roomCrypto) return
      socket.send(JSON.stringify({ type: 'message', encrypted: await roomCrypto.encrypt(content) }))
      socket.send(JSON.stringify({ type: 'typing', isTyping: false }))
    } else {
      socket.send(JSON.stringify({ type: 'message', content }))
      socket.send(JSON.stringify({ type: 'typing', isTyping: false, content: '' }))
    }
    if (typingRef.current) window.clearTimeout(typingRef.current)
    setDraft('')
    window.requestAnimationFrame(() => {
      composerRef.current?.focus({ preventScroll: true })
    })
  }

  async function updateDraft(value: string) {
    setDraft(value)
    const socket = socketRef.current
    if (socket?.readyState !== WebSocket.OPEN || !roomAccess?.canSend) return
    if (roomAccess?.encrypted) {
      const roomCrypto = roomCryptoRef.current
      if (!roomCrypto) return
      socket.send(JSON.stringify({ type: 'typing', isTyping: Boolean(value.trim()), encrypted: await roomCrypto.encrypt(value) }))
    } else {
      socket.send(JSON.stringify({ type: 'typing', isTyping: Boolean(value.trim()), content: value }))
    }
    if (typingRef.current) window.clearTimeout(typingRef.current)
    typingRef.current = window.setTimeout(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'typing', isTyping: false, content: '' }))
      }
    }, 1_200)
  }

  function unlockRoom(event: React.FormEvent) {
    event.preventDefault()
    if (!passwordInput) return
    sessionStorage.setItem(`active-chat:room-password:${roomId}`, passwordInput)
    setRoomPassword(passwordInput)
    setPasswordInput('')
    setRoomAccess(null)
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(window.location.href)
    setInviteCopied(true)
    window.setTimeout(() => setInviteCopied(false), 2_000)
  }

  if (!session) return <div className="grid min-h-dvh place-items-center bg-background"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div>

  const otherTypers = [...typing.values()]
  return (
    <main
      className="flex flex-col overflow-hidden bg-background text-foreground"
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100dvh' }}
    >
      <header className="safe-top flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 text-foreground shadow-sm backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" search={{ room: undefined }} className="grid size-10 shrink-0 place-items-center rounded-md transition hover:bg-muted" aria-label="Leave room"><ArrowLeft className="size-5" /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold">{roomId}</span>
              <ConnectionBadge state={connection} />
            </div>
            <p className="truncate text-xs text-muted-foreground">{onlineCount} {onlineCount === 1 ? 'person' : 'people'} online · Chatting as {session.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void copyInvite()} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-muted">
            {inviteCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <span className="hidden sm:inline">{inviteCopied ? 'Copied' : 'Invite'}</span>
          </button>
          <Link to="/" search={{ room: undefined }} className="grid size-9 place-items-center rounded-md border border-input bg-background transition-colors hover:bg-muted" aria-label="Edit nickname"><Pencil className="size-3.5" /></Link>
          <ThemeSwitcher />
        </div>
      </header>

      <section className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto mt-12 max-w-sm text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-lg bg-muted text-foreground"><SendHorizontal className="size-6" /></div>
              <h1 className="mt-4 text-lg font-semibold">The room is ready.</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Send the first message. Nothing is retained after everyone leaves.</p>
            </motion.div>
          )}
          <div className="flex min-h-full flex-col justify-end">
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  if (message.type === 'system') {
                    return <motion.p key={message.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="py-1 text-center text-xs text-muted-foreground">{message.content}</motion.p>
                  }
                  const own = message.userId === session.id
                  return (
                    <motion.article
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.18 }}
                      className={`flex gap-2.5 ${own ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar name={message.username} />
                      <div className={`max-w-[min(82%,34rem)] ${own ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className="mb-1 flex items-baseline gap-2 px-1 text-xs text-muted-foreground">
                          <span>{own ? 'You' : message.username}</span>
                          <time>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                        </div>
                        <p className={`whitespace-pre-wrap break-words rounded-lg border px-3 py-2 text-[15px] leading-6 ${own ? 'border-zinc-700 bg-zinc-800 text-zinc-100 dark:border-zinc-700 dark:bg-zinc-800' : 'border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'}`}>{message.content}</p>
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {otherTypers.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-live="polite" className="mt-4 max-w-[min(82%,34rem)] rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{otherTypers.map((user) => user.name).join(', ')}</span> {otherTypers.length === 1 ? 'is' : 'are'} typing:
                  <span className="ml-1 break-words text-foreground/80">{otherTypers.map((user) => user.content).join(' · ')}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>
        </div>

        {roomAccess?.encrypted && !roomAccess.canSend ? (
          <form onSubmit={unlockRoom} className="safe-bottom border-t border-border bg-background/95 p-3 backdrop-blur-xl sm:p-4">
            <div className="mx-auto flex max-w-xl items-center gap-2 rounded-lg border border-input bg-card p-2">
              <KeyRound className="ml-2 size-4 shrink-0 text-muted-foreground" />
              <input value={passwordInput} onChange={(event) => setPasswordInput(event.target.value)} type="password" autoComplete="current-password" autoFocus placeholder="Enter the room password to read and reply" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[16px] outline-none placeholder:text-muted-foreground" />
              <button type="submit" disabled={!passwordInput} className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 disabled:opacity-40 dark:bg-zinc-700">Unlock</button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">{roomPassword ? 'That password cannot decrypt this room. You remain read-only.' : 'Your password stays on this device. Encrypted messages cannot be read until it matches.'}</p>
          </form>
        ) : (
        <form onSubmit={(event) => void send(event)} className="safe-bottom border-t border-border bg-background/95 p-3 backdrop-blur-xl sm:p-4">
          <div className="flex items-end gap-2 rounded-lg border border-input bg-card p-2 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              ref={composerRef}
              value={draft}
              onChange={(event) => void updateDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              rows={1}
              maxLength={4_000}
              placeholder={connection === 'connected' ? 'Write a message…' : 'Reconnecting…'}
              disabled={connection !== 'connected' || !roomAccess?.canSend}
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[16px] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              aria-label="Message"
            />
            <button type="submit" onPointerDown={(event) => event.preventDefault()} disabled={!draft.trim() || connection !== 'connected' || !roomAccess?.canSend} className="grid size-10 shrink-0 place-items-center rounded-md bg-zinc-800 text-zinc-100 transition hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message">
              <SendHorizontal className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
        </form>
        )}
      </section>
    </main>
  )
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const active = state === 'connected'
  return <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
    {active ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
    <span className="hidden sm:inline">{active ? 'Live' : state === 'offline' ? 'Reconnecting' : 'Connecting'}</span>
  </span>
}

function Avatar({ name }: { name: string }) {
  return <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">{name.slice(0, 1).toUpperCase()}</span>
}
