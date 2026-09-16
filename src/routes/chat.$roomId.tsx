import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, LoaderCircle, SendHorizontal, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { chatSocket, getSession, type ChatEvent, type ChatMessage, type Session } from '../lib/chat-client'
import { ThemeSwitcher } from '../components/theme-switcher'

export const Route = createFileRoute('/chat/$roomId')({
  component: ChatRoom,
})

type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'offline'

function ChatRoom() {
  const { roomId } = Route.useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState<Map<string, { name: string; content: string }>>(new Map())
  const [draft, setDraft] = useState('')
  const [connection, setConnection] = useState<ConnectionState>('connecting')
  const socketRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<number | null>(null)
  const typingRef = useRef<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    void getSession().then((current) => {
      if (!active) return
      if (!current) {
        void navigate({ to: '/' })
        return
      }
      setSession(current)
    })
    return () => { active = false }
  }, [navigate])

  useEffect(() => {
    if (!session) return
    let active = true
    let attempts = 0

    const connect = () => {
      if (!active) return
      setConnection(attempts === 0 ? 'connecting' : 'reconnecting')
      const socket = chatSocket(roomId)
      socketRef.current = socket
      socket.onopen = () => {
        attempts = 0
        setConnection('connected')
      }
      socket.onmessage = (event) => {
        let payload: ChatEvent
        try {
          payload = JSON.parse(event.data) as ChatEvent
        } catch {
          return
        }
        if (payload.type === 'message') {
          setMessages((current) => current.some((message) => message.id === payload.id) ? current : [...current, payload])
        }
        if (payload.type === 'typing' && payload.userId !== session.id) {
          setTyping((current) => {
            const next = new Map(current)
            if (payload.isTyping) next.set(payload.userId, { name: payload.username, content: payload.content })
            else next.delete(payload.userId)
            return next
          })
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
  }, [roomId, session])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  function send(event: React.FormEvent) {
    event.preventDefault()
    const content = draft.trim()
    if (!content || socketRef.current?.readyState !== WebSocket.OPEN) return
    socketRef.current.send(JSON.stringify({ type: 'message', content }))
    socketRef.current.send(JSON.stringify({ type: 'typing', isTyping: false, content: '' }))
    if (typingRef.current) window.clearTimeout(typingRef.current)
    setDraft('')
  }

  function updateDraft(value: string) {
    setDraft(value)
    const socket = socketRef.current
    if (socket?.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({ type: 'typing', isTyping: Boolean(value.trim()), content: value }))
    if (typingRef.current) window.clearTimeout(typingRef.current)
    typingRef.current = window.setTimeout(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'typing', isTyping: false, content: '' }))
      }
    }, 1_200)
  }

  if (!session) return <div className="grid min-h-dvh place-items-center bg-background"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div>

  const otherTypers = [...typing.values()]
  return (
    <main className="flex h-dvh flex-col bg-background text-foreground">
      <header className="safe-top flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 text-foreground shadow-sm backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="grid size-10 shrink-0 place-items-center rounded-md transition hover:bg-muted" aria-label="Leave room"><ArrowLeft className="size-5" /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold">{roomId}</span>
              <ConnectionBadge state={connection} />
            </div>
            <p className="truncate text-xs text-muted-foreground">Chatting as {session.name}</p>
          </div>
        </div>
        <ThemeSwitcher />
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
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((message) => {
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
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 max-w-[min(82%,34rem)] rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{otherTypers.map((user) => user.name).join(', ')}</span> {otherTypers.length === 1 ? 'is' : 'are'} typing:
                <span className="ml-1 break-words text-foreground/80">{otherTypers.map((user) => user.content).join(' · ')}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <form onSubmit={send} className="safe-bottom border-t border-border bg-background/95 p-3 backdrop-blur-xl sm:p-4">
          <div className="flex items-end gap-2 rounded-lg border border-input bg-card p-2 shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              value={draft}
              onChange={(event) => updateDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              rows={1}
              maxLength={4_000}
              placeholder={connection === 'connected' ? 'Write a message…' : 'Reconnecting…'}
              disabled={connection !== 'connected'}
              className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[16px] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              aria-label="Message"
            />
            <button type="submit" disabled={!draft.trim() || connection !== 'connected'} className="grid size-10 shrink-0 place-items-center rounded-md bg-zinc-800 text-zinc-100 transition hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message">
              <SendHorizontal className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Enter to send · Shift + Enter for a new line</p>
        </form>
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
