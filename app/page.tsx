'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'

export default function Home() {
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

  if (!user) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Hello, {user.user_metadata.full_name.split(' ')[0]}</h1>
      <form onSubmit={handleSecretSubmit} className="w-64">
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
    </div>
  )
}

