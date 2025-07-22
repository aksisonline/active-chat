'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import Logo from '@/components/logo-button'
import { Shortcuts } from '@/components/shortcuts'

type User = {
  id: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
} | {
  id: string;
  name: string;
  isAnonymous: true;
  avatar: string | null;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
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
    const getUser = async () => {
      // Check for anonymous user first
      const anonymousUserData = localStorage.getItem('anonymousUser');
      if (anonymousUserData) {
        const anonymousUser = JSON.parse(anonymousUserData);
        setUser(anonymousUser);
        return;
      }

      // Then check for authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [router])

  const getUserName = (user: User | null): string => {
    if (!user) return 'Unknown';
    if ('isAnonymous' in user) return user.name;
    return user.user_metadata?.full_name || 'Unknown User';
  };

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (secret.trim()) {
      // Add to recent channels when manually entered
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
    if (user && 'isAnonymous' in user) {
      // For anonymous users, just clear localStorage
      localStorage.removeItem('anonymousUser');
    } else {
      // For authenticated users, sign out from Supabase
      await supabase.auth.signOut();
    }
    router.push('/login')
  }

  if (!user) return null

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
              <h1 className="text-2xl font-bold">Welcome, {getUserName(user)}!</h1>
              {user && 'isAnonymous' in user && (
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

