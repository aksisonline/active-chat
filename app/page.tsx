'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { app } from '@/lib/firebase'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

export default function Home() {
  const [user, setUser] = useState(null)
  const [secret, setSecret] = useState('')
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (secret.trim()) {
      router.push(`/chat/${encodeURIComponent(secret)}`)
    }
  }

  const handleLogout = async () => {
    const auth = getAuth(app)
    await signOut(auth)
    router.push('/login')
  }

  if (!user) return null

  return (
    <div>
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">Hello, {user.displayName.split(' ')[0]}</h1>
        <form onSubmit={handleSecretSubmit} className="w-64 mb-4">
          <Input
            type="text"
            placeholder="Enter secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mb-2"
          />
          <Button type="submit" className="w-full">
            Enter Chat Room
          </Button>
        </form>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}
