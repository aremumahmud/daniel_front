"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart2, Users, Activity, UserCog, Settings, UserPlus, Clock } from "lucide-react"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { Logo } from "@/components/logo"

const navItems = [
  { name: "Overview", icon: BarChart2, href: "/dashboard", key: "overview" },
  { name: "Patients", icon: Users, href: "/dashboard/patients", key: "patients" },
  { name: "Add New Patient", icon: UserPlus, href: "/dashboard/patients/new", key: "add-patient" },
  { name: "Analytics", icon: Activity, href: "/dashboard/analytics", key: "analytics" },
  { name: "Doctors", icon: UserCog, href: "/dashboard/doctors", key: "doctors" },
  { name: "Queue Management", icon: Clock, href: "/dashboard/queue", key: "queue" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings", key: "settings" },
]

interface SideNavProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function SideNav({ activeTab, setActiveTab }: SideNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex w-64 flex-col bg-background p-4 shadow-lg border-r">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <DarkModeToggle />
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <motion.li key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {setActiveTab ? (
              <button
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center rounded-md p-3 transition-colors ${
                  activeTab === item.key ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center rounded-md p-3 transition-colors ${
                  pathname === item.href ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )}
          </motion.li>
        ))}
      </ul>
      <div className="mt-auto flex items-center border-t border-border pt-4">
        <img src="/placeholder.svg?height=40&width=40" alt="Admin" className="mr-3 h-10 w-10 rounded-full" />
        <div>
          <p className="font-medium text-foreground">John Doe</p>
          <p className="text-sm text-muted-foreground">Admin</p>
        </div>
      </div>
    </nav>
  )
}
