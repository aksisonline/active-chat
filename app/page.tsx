'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [secret, setSecret] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    }
    getUser()
  }, [router])


  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (secret.trim()) {
      router.push(`/chat/${encodeURIComponent(secret)}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back!
            </h1>
            <p className="text-lg text-muted-foreground">
              Hello, {user.user_metadata.full_name.split(' ')[0]}
            </p>
          </div>
          
          <form onSubmit={handleSecretSubmit} className="space-y-4">
            <div>
              <label htmlFor="secret" className="block text-sm font-medium mb-2">
                Chat Room Secret
              </label>
              <Input
                id="secret"
                type="text"
                placeholder="Enter secret"
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

