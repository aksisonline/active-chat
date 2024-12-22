"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" style={{ color: "transparent", filter: "invert(100%)" }}>
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem] text-primary" /> : <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
