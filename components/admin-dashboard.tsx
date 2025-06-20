"use client"

import { useState, useEffect } from "react"
import { SideNav } from "@/components/side-nav"
import { Overview } from "@/components/overview"
import { PatientSearch } from "@/components/patient-search"
import { PatientTiles } from "@/components/patient-tiles"
import { PatientsPage } from "@/components/patients-page"
import { AnalyticsPage } from "@/components/analytics-page"
import { DoctorsPage } from "@/components/doctors-page"
import { SettingsPage } from "@/components/settings-page"
import { motion } from "framer-motion"
import { adminService } from "@/services/admin.service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { AdminDashboard as AdminDashboardType } from "@/lib/types/api"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState<AdminDashboardType | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await adminService.getDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to load dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === "overview" && (
            <>
              <h1 className="text-4xl font-bold text-foreground">Admin Dashboard - Welcome, {user?.firstName}</h1>
              {loading ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="p-6 rounded-lg border">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <>
                  <Overview dashboardData={dashboardData} />
                  <div className="glassmorphism p-6 rounded-xl">
                    <PatientSearch />
                  </div>
                  <div className="claymorphism p-6">
                    <PatientTiles />
                  </div>
                </>
              )}
            </>
          )}
          {activeTab === "patients" && <PatientsPage />}
          {activeTab === "analytics" && <AnalyticsPage />}
          {activeTab === "doctors" && <DoctorsPage />}
          {activeTab === "settings" && <SettingsPage />}
        </motion.div>
      </main>
    </div>
  )
}
