"use client"

import { ThemeProvider } from "@/components/theme-provider"
import '@/app/globals.css'
import LogoButton from "@/components/logo-button"

export default function AboutUs({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

            {/* Logo Code */}
            <LogoButton />

          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

