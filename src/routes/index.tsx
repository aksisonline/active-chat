import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock3, LogOut, MessageCirclePlus, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { endSession, getSession, startSession, type Session } from '../lib/chat-client'
import { ThemeSwitcher } from '../components/theme-switcher'

type RecentRoom = { name: string; lastVisited: number }

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([])
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    void getSession().then(setSession)
    try {
      setRecentRooms(JSON.parse(localStorage.getItem('active-chat:recent-rooms') ?? '[]') as RecentRoom[])
    } catch {
      localStorage.removeItem('active-chat:recent-rooms')
    }
  }, [])

  function enterRoom(roomName: string) {
    const normalized = roomName.trim().replaceAll(/\s+/g, ' ')
    if (!/^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,98}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(normalized)) {
      setError('Use 1–100 letters, numbers, spaces, dots, hyphens, or underscores.')
      return
    }
    const next = [{ name: normalized, lastVisited: Date.now() }, ...recentRooms.filter((item) => item.name !== normalized)].slice(0, 5)
    setRecentRooms(next)
    localStorage.setItem('active-chat:recent-rooms', JSON.stringify(next))
    void navigate({ to: '/chat/$roomId', params: { roomId: normalized } })
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!session) {
      setJoining(true)
      try {
        setSession(await startSession(name.trim()))
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not start your session.')
      } finally {
        setJoining(false)
      }
      return
    }
    enterRoom(room)
  }

  async function signOut() {
    await endSession()
    setSession(null)
  }

  if (session === undefined) return <div className="min-h-dvh bg-background" />

  return (
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-4 text-foreground sm:p-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/.16),transparent_30%),radial-gradient(circle_at_100%_100%,hsl(var(--primary)/.1),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-2rem)] max-w-4xl flex-col">
        <header className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <img src="/ac_logo_light.svg" width="32" height="32" alt="" className="dark:hidden" />
            <img src="/ac_logo_dark.svg" width="32" height="32" alt="" className="hidden dark:block" />
            Active Chat
          </a>
          <ThemeSwitcher />
        </header>

        <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" /> Live when you are
            </div>
            <h1 className="max-w-lg text-4xl font-bold tracking-tight sm:text-5xl">
              A room is all you need to start talking.
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">
              Pick a display name once, then create or join a private room. Messages exist only while people are connected.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            onSubmit={submit}
            className="mt-8 rounded-3xl border border-border bg-card/80 p-5 shadow-2xl shadow-black/5 backdrop-blur sm:p-6"
          >
            <AnimatePresence mode="wait">
              {!session ? (
                <motion.div key="identity" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <label htmlFor="display-name" className="text-sm font-semibold">Choose a display name</label>
                  <p className="mt-1 text-sm text-muted-foreground">This is stored in a signed session cookie, not an account.</p>
                  <input
                    id="display-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={50}
                    autoComplete="nickname"
                    autoFocus
                    placeholder="Your name"
                    className="mt-4 h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button disabled={!name.trim() || joining} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                    {joining ? 'Starting…' : <>Continue <ArrowRight className="size-4" /></>}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="room" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">You’re chatting as</p>
                      <p className="font-semibold">{session.name}</p>
                    </div>
                    <button type="button" onClick={() => void signOut()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
                      <LogOut className="size-4" /> Reset
                    </button>
                  </div>
                  <label htmlFor="room-name" className="mt-5 block text-sm font-semibold">Create or join a room</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="room-name"
                      value={room}
                      onChange={(event) => setRoom(event.target.value)}
                      maxLength={100}
                      autoComplete="off"
                      autoFocus
                      placeholder="Room name"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button aria-label="Enter room" className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:scale-105 active:scale-95">
                      <ArrowRight className="size-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          </motion.form>

          {session && recentRooms.length > 0 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-7">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4" /> Recent rooms</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {recentRooms.map((item) => (
                  <div key={item.name} className="group flex items-center rounded-2xl border border-border bg-card/50 p-2">
                    <button type="button" onClick={() => enterRoom(item.name)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-muted">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><MessageCirclePlus className="size-4" /></span>
                      <span className="min-w-0"><span className="block truncate text-sm font-medium">{item.name}</span><span className="block text-xs text-muted-foreground">{formatAgo(item.lastVisited)}</span></span>
                    </button>
                    <button type="button" onClick={() => {
                      const next = recentRooms.filter((roomItem) => roomItem.name !== item.name)
                      setRecentRooms(next)
                      localStorage.setItem('active-chat:recent-rooms', JSON.stringify(next))
                    }} className="grid size-9 place-items-center rounded-lg text-muted-foreground opacity-100 transition hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Remove ${item.name}`}>
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </section>
      </div>
    </main>
  )
}

function formatAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  return `${Math.floor(minutes / 1440)}d ago`
}
