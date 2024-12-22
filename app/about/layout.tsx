"use client"

import '@/app/globals.css'
import { ThemeProvider } from '@/components/theme-provider'

export default function AboutUs({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider attribute="class">
      <body>
          {children}
      </body>
      </ThemeProvider>
    </html>
  )
}

