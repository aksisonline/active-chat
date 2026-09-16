import { motion } from 'framer-motion'
import { Info, KeyRound, Lock, Pencil, Shield, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ThemeSwitcher } from '../components/theme-switcher'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { configureRoom, getSession, startSession, updateSessionName, type Session } from '../lib/chat-client'
import { createEncryptedBootstrap, createRoomCrypto } from '../lib/room-crypto'

export const Route = createFileRoute('/')({
  validateSearch: (search) => ({ room: typeof search.room === 'string' ? search.room : undefined }),
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isJoining, setIsJoining] = useState(false)
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [password, setPassword] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [error, setError] = useState('')

  const { room: invitedRoom } = Route.useSearch()
  useEffect(() => {
    if (invitedRoom) setRoom(invitedRoom)
    void getSession().then(setSession)
  }, [invitedRoom])

  async function enterRoom(roomId: string) {
    if (password) {
      const roomCrypto = await createRoomCrypto(roomId, password)
      await configureRoom(roomId, await createEncryptedBootstrap(roomCrypto))
      sessionStorage.setItem(`active-chat:room-password:${roomId}`, password)
    }
    await navigate({ to: '/chat/$roomId', params: { roomId } })
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!session) {
      try {
        setIsJoining(true)
        const newSession = await startSession(name)
        setSession(newSession)
        if (invitedRoom) await enterRoom(invitedRoom)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not start your session.')
      } finally {
        setIsJoining(false)
      }
      return
    }
    const roomId = room.trim().replaceAll(/\s+/g, ' ')
    if (!/^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,98}[a-zA-Z0-9]$|^[a-zA-Z0-9]$/.test(roomId)) {
      setError('Enter a room name using 1–100 letters, numbers, spaces, dots, hyphens, or underscores.')
      return
    }
    await enterRoom(roomId)
  }

  async function saveName() {
    try {
      setSession(await updateSessionName(name))
      setEditingName(false)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update your name.')
    }
  }

  if (session === undefined) return null
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/80 px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      <Link to="/about" className="absolute left-4 top-4 z-10"><Button variant="outline" size="icon"><Info className="size-5" /><span className="sr-only">About Active Chat</span></Button></Link>
      <div className="absolute right-4 top-4 z-10"><ThemeSwitcher /></div>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative mb-6 text-center text-3xl font-bold text-primary sm:mb-8 sm:text-4xl">
        {session ? 'ACTIVE CHAT' : 'SECURE · ACTIVE · PRIVATE'}
      </motion.h1>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative w-full max-w-lg">
        <Card className="border-border bg-background/40 backdrop-blur-xl">
          <CardContent className="space-y-6 p-6 sm:space-y-8 sm:p-8">
            <div className="flex justify-center pt-2"><img src="/ac_logo_light.svg" alt="Active Chat" width="60" height="60" className="dark:hidden" /><img src="/ac_logo_dark.svg" alt="Active Chat" width="60" height="60" className="hidden dark:block" /></div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">Welcome to Active Chat</h2>
              <p className="mx-auto max-w-[600px] text-sm text-muted-foreground sm:text-base md:text-lg">Where privacy meets conversation. Secure, anonymous, serverless messaging for your peace of mind.</p>
              {invitedRoom && <p className="pt-2 text-sm font-medium text-foreground">You&apos;ve been invited to join <span className="font-mono">{invitedRoom}</span>.</p>}
            </div>
            <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2 sm:py-4">
              <div className="flex items-center gap-2 text-muted-foreground"><Shield className="size-4 text-primary" /><span className="text-xs sm:text-sm">Privacy without conditions</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Lock className="size-4 text-primary" /><span className="text-xs sm:text-sm">No chats saved</span></div>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {!session ? (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Display Name</label>
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your display name" maxLength={50} required autoFocus />
                  <p className="text-xs text-muted-foreground">Saved in a signed cookie only. No account required.</p>
                  <Button className="h-auto w-full py-4 text-base font-medium sm:py-6 sm:text-lg" disabled={!name.trim() || isJoining}><User className="size-5" />{isJoining ? 'Starting…' : 'Chat Anonymously'}</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                    <span>You&apos;re chatting as <strong className="text-foreground">{session.name}</strong></span>
                    <button type="button" onClick={() => { setName(session.name); setEditingName(true) }} className="text-foreground hover:text-muted-foreground" aria-label="Edit nickname"><Pencil className="size-3.5" /></button>
                  </div>
                  {editingName && <div className="flex gap-2"><Input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} aria-label="New display name" /><Button type="button" variant="outline" onClick={() => void saveName()} disabled={!name.trim()}>Save</Button></div>}
                  <div className="space-y-2"><label htmlFor="room" className="text-sm font-medium">Chat Room Secret</label><Input id="room" value={room} onChange={(event) => setRoom(event.target.value)} placeholder="Enter or create a room secret" maxLength={100} required autoFocus /></div>
                  <div className="space-y-2"><label htmlFor="password" className="flex items-center gap-2 text-sm font-medium"><KeyRound className="size-4" />Room password <span className="font-normal text-muted-foreground">(optional · work in progress)</span></label><Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Set one for a new encrypted room, or enter one to join" autoComplete="current-password" /><p className="text-xs text-muted-foreground">Passwords never leave this device. Share them separately from the invite link.</p></div>
                  <Button className="h-auto w-full py-4 text-base font-medium sm:py-6 sm:text-lg" disabled={!room.trim()}>Join Chat Room</Button>
                </>
              )}
              {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
            </form>
            <p className="text-center text-[10px] text-muted-foreground sm:text-xs">Private rooms are live only while people are connected.</p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
