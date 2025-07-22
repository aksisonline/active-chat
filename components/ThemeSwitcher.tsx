import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  // fallback to system if resolvedTheme is undefined (hydration)
  const currentTheme = resolvedTheme || theme || 'system';
  const isDark = currentTheme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="transition-colors"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-transform duration-200 hover:-rotate-12" />
      )}
      <span className="sr-only">
        Switch to {isDark ? 'light' : 'dark'} mode
      </span>
    </Button>
  );
}