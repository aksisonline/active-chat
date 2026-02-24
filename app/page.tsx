'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from '@/lib/auth-client'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import Logo from '@/components/logo-button'
import { Shortcuts } from '@/components/shortcuts'

type AnonymousUser = {
  id: string;
  name: string;
  isAnonymous: true;
  avatar: string | null;
}

export default function Home() {
  const { data: session, isPending } = useSession()
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null)
  const [secret, setSecret] = useState('')
  const [initialAction, setInitialAction] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for action parameter from shortcuts
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')
    if (action) {
      setInitialAction(action)
      // Clean up URL without causing navigation
      window.history.replaceState({}, '', '/')
    }
  }, [])

  useEffect(() => {
    // Check for anonymous user
    const anonymousUserData = localStorage.getItem('anonymousUser');
    if (anonymousUserData) {
      setAnonymousUser(JSON.parse(anonymousUserData));
      return;
    }

    // If no session and not loading, redirect to login
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  const getUserName = (): string => {
    if (anonymousUser) return anonymousUser.name;
    return session?.user?.name || session?.user?.email || 'Unknown User';
  };

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (secret.trim()) {
      addToRecentChannels(secret.trim())
      router.push(`/chat/${encodeURIComponent(secret)}`)
    }
  }

  const handleChannelSelect = (channelSecret: string) => {
    router.push(`/chat/${encodeURIComponent(channelSecret)}`)
  }

  const addToRecentChannels = (secret: string) => {
    const recentChannels = JSON.parse(localStorage.getItem('recentChannels') || '[]')
    const newChannel = {
      secret,
      name: secret,
      lastVisited: Date.now()
    }
    const existing = recentChannels.filter((ch: { secret: string }) => ch.secret !== secret)
    const updated = [newChannel, ...existing].slice(0, 5)
    localStorage.setItem('recentChannels', JSON.stringify(updated))
  }

  const handleLogout = async () => {
    if (anonymousUser) {
      localStorage.removeItem('anonymousUser');
      setAnonymousUser(null);
    } else {
      await signOut();
    }
    router.push('/login')
  }

  if (isPending && !anonymousUser) return null
  if (!session && !anonymousUser) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-4">
            <Logo className="mx-auto" />
            <div>
              <h1 className="text-2xl font-bold">Welcome, {getUserName()}!</h1>
              {anonymousUser && (
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;re chatting as a guest
                </p>
              )}
            </div>
          </div>
          
          {/* Shortcuts Component */}
          <Shortcuts onChannelSelect={handleChannelSelect} initialAction={initialAction} />
          
          {/* Chat Room Entry Form */}
          <div className="pt-4 border-t">
            <form onSubmit={handleSecretSubmit} className="space-y-4">
              <div>
                <label htmlFor="secret" className="block text-sm font-medium mb-2">
                  Create or join a chat room
                </label>
                <Input
                  id="secret"
                  type="text"
                  placeholder="Enter or create a room secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Enter Chat Room
              </Button>
            </form>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="w-full"
              size="lg"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

