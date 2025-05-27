"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart2, Users, Activity, UserCog, Settings, UserPlus } from "lucide-react"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const navItems = [
  { name: "Overview", icon: BarChart2, href: "/dashboard" },
  { name: "Patients", icon: Users, href: "/dashboard/patients" },
  { name: "Add New Patient", icon: UserPlus, href: "/dashboard/patients/new" },
  { name: "Analytics", icon: Activity, href: "/dashboard/analytics" },
  { name: "Doctors", icon: UserCog, href: "/dashboard/doctors" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav className="flex w-64 flex-col bg-background p-4 shadow-lg">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Dealth.</h2>
        <DarkModeToggle />
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <motion.li key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={item.href}
              className={`flex items-center rounded-md p-3 transition-colors ${
                pathname === item.href ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
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
