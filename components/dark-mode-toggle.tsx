"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full">
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
