/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import MorphingText from '@/components/ui/morphing-text'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      alert('Error logging in')
    } finally {
      setLoading(false)
    }
  }

  const texts = [
  "Hello",
  "Morphing",
  "Text",
  "Animation",
  "React",
  "Component",
  "Smooth",
  "Transition",
  "Engaging",
];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex p-10">
        <MorphingText texts={texts} />
      </div>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome to Incognito Chat</CardTitle>
          <CardDescription>Sign in to start chatting</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? 'Loading...' : 'Sign in with Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

