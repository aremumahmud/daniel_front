"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ClipboardList,
  HeartPulse,
  LogOut,
  Menu,
  Moon,
  Pill,
  Stethoscope,
  Sun,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

// One entry point per role — each portal is a single, focused workspace.
const NAV_BY_ROLE: Record<string, { section: string; items: NavItem[] }> = {
  receptionist: {
    section: "Front Desk",
    items: [{ label: "Reception", href: "/reception", icon: ClipboardList }],
  },
  doctor: {
    section: "Clinical",
    items: [{ label: "My Queue", href: "/doctor/queue", icon: Stethoscope }],
  },
  pharmacist: {
    section: "Pharmacy",
    items: [{ label: "Prescriptions", href: "/pharmacy", icon: Pill }],
  },
  student: {
    section: "My Health",
    items: [{ label: "Health Record", href: "/student/dashboard", icon: HeartPulse }],
  },
}

function initialsOf(name?: string, email?: string) {
  const source = name?.trim() || email || "?"
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase()
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const nav = user ? NAV_BY_ROLE[user.role] : undefined

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <Image
          src="/download.jpeg"
          alt="University of Ilorin"
          width={26}
          height={26}
          className="rounded-full object-cover"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight">UniIlorin Clinic</p>
          <p className="truncate text-[11px] text-muted-foreground">Health Records</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {nav && (
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {nav.section}
            </p>
            {nav.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      <div className="border-t p-3">
        <p className="px-2 text-[11px] text-muted-foreground">University of Ilorin Clinic</p>
      </div>
    </div>
  )
}

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await logout()
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-muted/30 lg:block">
        <SidebarNav />
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <h2 className="truncate text-sm font-medium text-muted-foreground">{title}</h2>

          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 gap-2 px-1.5" aria-label="Account menu">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] font-medium">
                      {initialsOf(user?.fullName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[10rem] truncate text-sm sm:inline">
                    {user?.fullName || user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium">{user?.fullName || "Signed in"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">Role: {user?.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
