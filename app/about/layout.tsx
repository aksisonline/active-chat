"use client"

import '@/app/globals.css'
import Logo from "@/components/logo-button"

export default function AboutUs({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>

            {/* Logo Code */}
            <Logo />

          {children}

      </body>
    </html>
  )
}

