"use client"

import { useState, useEffect } from "react"
import { EnhancedDashboard } from "@/components/enhanced-dashboard"
import { PatientSearch } from "@/components/patient-search"
import { PatientTiles } from "@/components/patient-tiles"
import { AdminGuard } from "@/components/auth-guard"
import { ApiTestDebug } from "@/components/api-test-debug"
import { adminService } from "@/services/admin.service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Search, Users, Bug } from "lucide-react"
import type { AdminDashboard as AdminDashboardType } from "@/lib/types/api"

function AdminDashboardContent() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardType | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      console.log("Loading admin dashboard data...")
      console.log("User role:", user?.role)

      // Try to get dashboard data
      const data = await adminService.getDashboard()
      console.log("Dashboard data loaded successfully:", data)
      setDashboardData(data)

      // Optionally, also try to get admin profile for additional info
      try {
        const adminProfile = await adminService.getAdminProfile()
        console.log("Admin profile loaded successfully:", adminProfile)
        // You can use this data to enhance the dashboard with statistics, capabilities, etc.
      } catch (profileError) {
        console.log("Admin profile not available (this is optional):", profileError)
        // This is optional, so we don't show an error to the user
      }

    } catch (error) {
      console.error("Failed to load dashboard:", error)
      console.error("Error details:", error)
      toast({
        title: "Error",
        description: `Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-lg border">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="glassmorphism p-6 rounded-xl">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="flex space-x-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-20" />
          </div>
        </div>
        <div className="claymorphism p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Admin Dashboard - Welcome, {user?.firstName}</h1>
        <p className="text-muted-foreground mt-2">Comprehensive healthcare system management</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Patient Search</span>
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Patient Management</span>
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center space-x-2">
            <Bug className="h-4 w-4" />
            <span>API Debug</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EnhancedDashboard dashboardData={dashboardData} />
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <div className="glassmorphism p-6 rounded-xl">
            <PatientSearch />
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="claymorphism p-6">
            <PatientTiles />
          </div>
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <ApiTestDebug />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  )
}
