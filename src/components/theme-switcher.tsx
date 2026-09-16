import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="grid size-9 place-items-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent"
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
