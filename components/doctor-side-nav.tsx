"use client"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, Users, FileText, MessageSquare, Settings, Activity, Clock, Stethoscope } from "lucide-react"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const navItems = [
  { name: "Overview", icon: Activity, href: "/doctor/dashboard", key: "overview" },
  { name: "Appointments", icon: Calendar, href: "/doctor/appointments", key: "appointments" },
  { name: "My Patients", icon: Users, href: "/doctor/patients", key: "patients" },
  { name: "Medical Records", icon: FileText, href: "/doctor/records", key: "records" },
  { name: "Schedule", icon: Clock, href: "/doctor/schedule", key: "schedule" },
  { name: "Messages", icon: MessageSquare, href: "/doctor/messages", key: "messages" },
  { name: "Settings", icon: Settings, href: "/doctor/settings", key: "settings" },
]

interface DoctorSideNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DoctorSideNav({ activeTab, setActiveTab }: DoctorSideNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex w-64 flex-col bg-background p-4 shadow-lg border-r">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Stethoscope className="h-6 w-6 text-primary" />
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
        <img src="/placeholder.svg?height=40&width=40&text=DS" alt="Doctor" className="mr-3 h-10 w-10 rounded-full" />
        <div>
          <p className="font-medium text-foreground">Dr. John Smith</p>
          <p className="text-sm text-muted-foreground">Cardiologist</p>
        </div>
      </div>
    </nav>
  )
}
