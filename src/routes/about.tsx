import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ThemeSwitcher } from '../components/theme-switcher'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/about')({ component: About })

function About() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background p-4 text-foreground sm:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f18_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f18_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="relative flex items-center justify-between"><Link to="/" search={{ room: undefined }}><Button variant="outline" size="icon"><ArrowLeft /><span className="sr-only">Back to Active Chat</span></Button></Link><ThemeSwitcher /></div>
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto flex min-h-[80dvh] max-w-2xl flex-col justify-center text-center">
        <img src="/ac_logo_light.svg" alt="Active Chat" width="64" height="64" className="mx-auto dark:hidden" /><img src="/ac_logo_dark.svg" alt="Active Chat" width="64" height="64" className="mx-auto hidden dark:block" />
        <h1 className="mt-6 text-4xl font-bold">Active Chat</h1>
        <p className="mt-4 text-muted-foreground">A private, ephemeral place to talk. No accounts, no OAuth, and no message history.</p>
      </motion.section>
    </main>
  )
}
