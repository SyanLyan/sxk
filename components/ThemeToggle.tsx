"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" /> // Placeholder to prevent layout shift
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      aria-pressed={currentTheme === "dark"}
      title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
      className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-50 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      aria-label="Toggle Theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute top-2 left-2" />
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 dark:text-gray-200" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
