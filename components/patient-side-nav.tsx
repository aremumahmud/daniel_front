"use client"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, FileText, MessageSquare, Settings, Activity, Heart, User, Pill } from "lucide-react"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const navItems = [
  { name: "Overview", icon: Activity, href: "/patient/dashboard", key: "overview" },
  { name: "Appointments", icon: Calendar, href: "/patient/appointments", key: "appointments" },
  { name: "Medical Records", icon: FileText, href: "/patient/records", key: "records" },
  { name: "Medications", icon: Pill, href: "/patient/medications", key: "medications" },
  { name: "Health Metrics", icon: Heart, href: "/patient/health", key: "health" },
  { name: "Messages", icon: MessageSquare, href: "/patient/messages", key: "messages" },
  { name: "Profile", icon: User, href: "/patient/profile", key: "profile" },
  { name: "Settings", icon: Settings, href: "/patient/settings", key: "settings" },
]

interface PatientSideNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function PatientSideNav({ activeTab, setActiveTab }: PatientSideNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex w-64 flex-col bg-background p-4 shadow-lg border-r">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Dealth.</h2>
        </div>
        <DarkModeToggle />
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <motion.li key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => setActiveTab(item.key)}
              className={`flex w-full items-center rounded-md p-3 transition-colors ${
                activeTab === item.key ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          </motion.li>
        ))}
      </ul>
      <div className="mt-auto flex items-center border-t border-border pt-4">
        <img src="/placeholder.svg?height=40&width=40&text=JD" alt="Patient" className="mr-3 h-10 w-10 rounded-full" />
        <div>
          <p className="font-medium text-foreground">Jane Doe</p>
          <p className="text-sm text-muted-foreground">Patient ID: P001</p>
        </div>
      </div>
    </nav>
  )
}
