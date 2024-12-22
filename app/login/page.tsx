'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import MorphingText from '@/components/ui/morphing-text'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    } catch {
      alert('Error logging in')
    } finally {
      setLoading(false)
    }
  }

  const texts = [
    "SECURE",
    "SILENT",
    "ACTIVE",
    "CHATROOMS",
    "BACKROOMS",
    "PRIVATE"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background transition-colors duration-300">
      <div className="absolute top-4 right-4">
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem] text-primary" /> : <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </div>
      <div className="mb-8">
        <MorphingText texts={texts} className="text-4xl font-bold text-primary" />
      </div>
      <Card className="w-[350px] shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Active Chat</CardTitle>
          <CardDescription className="text-center">Where privacy meets conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} disabled={loading} className="w-full bg-primary text-primary-foreground">
            {loading ? 'Loading...' : 'Sign in with Google'}
          </Button>
        </CardContent>
      </Card>
      <p className="mt-8 text-sm text-muted-foreground">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
