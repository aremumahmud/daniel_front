"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Calendar,
  Activity,
  UserCheck,
  Stethoscope,
  Shield,
  TrendingUp,
  Clock,
  Server,
  Database,
  Wifi,
  AlertTriangle
} from "lucide-react"
import { adminService } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"
import type { AdminDashboard } from "@/lib/types/api"
import type { PatientStatistics } from "@/services/admin.service"

interface OverviewProps {
  dashboardData?: AdminDashboard | null
}

export function Overview({ dashboardData }: OverviewProps) {
  const [systemOverview, setSystemOverview] = useState<any>(null)
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [patientStatistics, setPatientStatistics] = useState<PatientStatistics | null>(null)
  const [doctorCount, setDoctorCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnhancedData()

    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadRealtimeData, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadEnhancedData = async () => {
    try {
      setLoading(true)

      // Load all enhanced data in parallel using the new analytics endpoints
      const [overviewData, metricsData, healthData, patientData, doctorData] = await Promise.allSettled([
        adminService.getAdminOverview(),
        adminService.getRealtimeMetrics(),
        adminService.getSystemHealth(),
        adminService.getPatientStatistics(),
        loadDoctorCount()
      ])

      if (overviewData.status === 'fulfilled') {
        setSystemOverview(overviewData.value)
      }

      if (metricsData.status === 'fulfilled') {
        setRealtimeMetrics(metricsData.value)
      }

      if (healthData.status === 'fulfilled') {
        setSystemHealth(healthData.value)
      }

      if (patientData.status === 'fulfilled') {
        setPatientStatistics(patientData.value)
      }

      if (doctorData.status === 'fulfilled') {
        setDoctorCount(doctorData.value)
      }

    } catch (error) {
      console.error("Failed to load enhanced overview data:", error)
      // Don't show error toast for optional data
    } finally {
      setLoading(false)
    }
  }

  const loadDoctorCount = async (): Promise<number> => {
    try {
      // Try the new doctors API first
      const doctorData = await adminService.getDoctors({ limit: 1, page: 1 })
      return doctorData.pagination.totalDoctors
    } catch (error) {
      console.warn("Doctors API failed, falling back to users API for count")
      try {
        // Fallback to users API
        const userData = await adminService.getUsers({ role: "doctor", limit: 1, page: 1 })
        return userData.total
      } catch (fallbackError) {
        console.error("Failed to get doctor count:", fallbackError)
        return 0
      }
    }
  }

  const loadRealtimeData = async () => {
    try {
      const [metricsData, healthData, patientData, doctorData] = await Promise.allSettled([
        adminService.getRealtimeMetrics(),
        adminService.getSystemHealth(),
        adminService.getPatientStatistics(),
        loadDoctorCount()
      ])

      if (metricsData.status === 'fulfilled') {
        setRealtimeMetrics(metricsData.value)
      }

      if (healthData.status === 'fulfilled') {
        setSystemHealth(healthData.value)
      }

      if (patientData.status === 'fulfilled') {
        setPatientStatistics(patientData.value)
      }

      if (doctorData.status === 'fulfilled') {
        setDoctorCount(doctorData.value)
      }
    } catch (error) {
      console.error("Failed to load realtime data:", error)
    }
  }

  // Combine patient statistics with admin overview data
  const userStats = {
    // Use new admin overview structure if available
    ...(systemOverview?.quickStats ? {
      totalUsers: systemOverview.quickStats.totalUsers,
      totalPatients: systemOverview.quickStats.totalPatients,
      totalDoctors: systemOverview.quickStats.totalDoctors || doctorCount,
      newUsersToday: systemOverview.quickStats.newUsersToday,
      newPatientsToday: systemOverview.quickStats.newPatientsToday,
      activeUsers: systemOverview.quickStats.totalUsers, // Approximation
      totalAdmins: 0 // Not provided in new API
    } :
    // Fallback to legacy structure or dashboard data
    systemOverview || dashboardData?.userStats || {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      totalPatients: 0,
      totalDoctors: doctorCount,
      totalAdmins: 0
    }),
    // Override with patient statistics if available
    ...(patientStatistics && {
      totalPatients: patientStatistics.overview.totalPatients,
      activePatients: patientStatistics.overview.activePatients,
      inactivePatients: patientStatistics.overview.totalInactivePatients
    }),
    // Ensure doctor count is always available
    totalDoctors: systemOverview?.quickStats?.totalDoctors || doctorCount || 0
  }

  const appointmentStats = dashboardData?.appointmentStats || {
    totalAppointments: 0,
    completedToday: 0,
    scheduledToday: 0,
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getHealthStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default'
      case 'warning': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPatients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.activePatients || userStats.activeUsers || 0} active • {userStats.inactivePatients || 0} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthcare Providers</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalDoctors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Doctors and specialists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats.scheduledToday}</div>
            <p className="text-xs text-muted-foreground">
              {appointmentStats.completedToday} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalAdmins || 0}</div>
            <p className="text-xs text-muted-foreground">
              Administrative users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics Row */}
      {realtimeMetrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users (Last Hour)</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {realtimeMetrics.recentActivity?.newUsersLastHour || realtimeMetrics.onlineUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {realtimeMetrics.recentActivity?.newUsersLast5Min || 0} in last 5 min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Patients (Last Hour)</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {realtimeMetrics.recentActivity?.newPatientsLastHour || realtimeMetrics.currentAppointments || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {realtimeMetrics.recentActivity?.newPatientsLast5Min || 0} in last 5 min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Response</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realtimeMetrics.dbStatus?.connected ? 'Connected' : 'Disconnected'}
              </div>
              <p className="text-xs text-muted-foreground">
                Response time: {realtimeMetrics.responseTime || 0}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realtimeMetrics.systemMetrics?.memoryUsage?.heapUsed || realtimeMetrics.systemLoad || 0}MB
              </div>
              <Progress
                value={realtimeMetrics.systemLoad || 0}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Health Section */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Health</span>
              <Badge variant={getHealthStatusVariant(systemHealth.status)}>
                {systemHealth.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.systemInfo?.uptime?.formatted ||
                     `${Math.floor((systemHealth.uptime || 0) / 3600)}h ${Math.floor(((systemHealth.uptime || 0) % 3600) / 60)}m`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      systemHealth.healthChecks?.database?.status === 'healthy' || systemHealth.databaseStatus === 'connected' ? 'bg-green-500' :
                      systemHealth.databaseStatus === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-muted-foreground capitalize">
                      {systemHealth.healthChecks?.database?.status || systemHealth.databaseStatus || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.healthChecks?.memory?.usage || `${systemHealth.memoryUsage || 0}%`}
                  </span>
                </div>
                <Progress value={systemHealth.memoryUsage || 0} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Node Version</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.systemInfo?.nodeVersion || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.cpuMetrics?.loadAverage?.[0]?.toFixed(2) || systemHealth.errorRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Environment</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.systemInfo?.environment || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Platform</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.systemInfo?.platform || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Architecture</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.systemInfo?.architecture || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU Cores</span>
                  <span className="text-sm text-muted-foreground">
                    {systemHealth.cpuMetrics?.cpuCount || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {systemHealth.status !== 'healthy' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">System Alert</p>
                  <p className="text-yellow-700">
                    {systemHealth.status === 'warning'
                      ? 'System performance may be degraded. Monitor closely.'
                      : 'Critical system issues detected. Immediate attention required.'
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
