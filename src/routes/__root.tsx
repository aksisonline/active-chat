import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'
import { useEffect } from 'react'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#111827' },
      { name: 'description', content: 'Ephemeral, real-time private chat rooms.' },
    ],
    links: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/service-worker.js')
    }
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
