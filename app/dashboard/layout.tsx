import type React from "react"
import { SideNav } from "@/components/side-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <SideNav />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
