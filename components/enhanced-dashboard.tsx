"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar, 
  Heart, 
  Shield,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { adminService } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"
import { Overview } from "@/components/overview"
import { PatientStatisticsComponent } from "@/components/patient-statistics"

interface EnhancedDashboardProps {
  dashboardData?: any
}

export function EnhancedDashboard({ dashboardData }: EnhancedDashboardProps) {
  const [systemOverview, setSystemOverview] = useState<any>(null)
  const [realtimeMetrics, setRealtimeMetrics] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [userAnalytics, setUserAnalytics] = useState<any>(null)
  const [appointmentAnalytics, setAppointmentAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadDashboardData()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadRealtimeData()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load all dashboard data in parallel using the new API endpoints
      const results = await Promise.allSettled([
        adminService.getAdminOverview(),
        adminService.getRealtimeMetrics(),
        adminService.getSystemHealth(),
        adminService.getUserAnalytics({ period: "month" }),
        adminService.getAppointmentAnalytics({ period: "month" })
      ])

      const [overviewResult, metricsResult, healthResult, userResult, appointmentResult] = results

      if (overviewResult.status === 'fulfilled') {
        setSystemOverview(overviewResult.value)
      }
      
      if (metricsResult.status === 'fulfilled') {
        setRealtimeMetrics(metricsResult.value)
      }
      
      if (healthResult.status === 'fulfilled') {
        setSystemHealth(healthResult.value)
      }
      
      if (userResult.status === 'fulfilled') {
        setUserAnalytics(userResult.value)
      }
      
      if (appointmentResult.status === 'fulfilled') {
        setAppointmentAnalytics(appointmentResult.value)
      }

      setLastUpdated(new Date())
      
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast({
        title: "Warning",
        description: "Some dashboard data may not be available",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRealtimeData = async () => {
    try {
      const [metricsResult, healthResult] = await Promise.allSettled([
        adminService.getRealtimeMetrics(),
        adminService.getSystemHealth()
      ])

      if (metricsResult.status === 'fulfilled') {
        setRealtimeMetrics(metricsResult.value)
      }
      
      if (healthResult.status === 'fulfilled') {
        setSystemHealth(healthResult.value)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to refresh realtime data:", error)
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Healthcare Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive system overview and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Alert */}
      {systemHealth && systemHealth.status !== 'healthy' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getHealthIcon(systemHealth.status)}
              <div>
                <p className="font-medium">System Health Alert</p>
                <p className="text-sm text-muted-foreground">
                  {systemHealth.status === 'warning' 
                    ? 'System performance may be degraded. Monitor closely.'
                    : 'Critical system issues detected. Immediate attention required.'
                  }
                </p>
              </div>
              <Badge variant={systemHealth.status === 'warning' ? 'secondary' : 'destructive'}>
                {systemHealth.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Patients</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Overview dashboardData={dashboardData} />
          
          {/* Quick Stats */}
          {(systemOverview || realtimeMetrics) && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {realtimeMetrics && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">New Users (Last Hour)</CardTitle>
                      <Activity className="h-4 w-4 text-green-600" />
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
                      <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {realtimeMetrics.dbStatus?.connected ? 'Connected' : 'Disconnected'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Response: {realtimeMetrics.responseTime || 0}ms
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
              
              {appointmentAnalytics && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {realtimeMetrics?.currentAppointments || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {appointmentAnalytics.totalAppointments > 0 
                          ? Math.round((appointmentAnalytics.completedAppointments / appointmentAnalytics.totalAppointments) * 100)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <PatientStatisticsComponent />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {userAnalytics && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                  <CardDescription>Login and registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {userAnalytics.userActivity && userAnalytics.userActivity.length > 0 ? (
                    <div className="space-y-4">
                      {userAnalytics.userActivity.slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{new Date(activity.date).toLocaleDateString()}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{activity.logins} logins</div>
                            <div className="text-xs text-muted-foreground">{activity.registrations} new users</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No activity data available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {userAnalytics.userGrowth && userAnalytics.userGrowth.length > 0 ? (
                    <div className="space-y-4">
                      {userAnalytics.userGrowth.slice(-5).map((growth: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{growth.month}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{growth.patients} patients</div>
                            <div className="text-xs text-muted-foreground">{growth.doctors} doctors</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No growth data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {systemHealth && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getHealthIcon(systemHealth.status)}
                    <span>System Status</span>
                    <Badge variant={systemHealth.status === 'healthy' ? 'default' : 
                                   systemHealth.status === 'warning' ? 'secondary' : 'destructive'}>
                      {systemHealth.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-medium">
                      {systemHealth.systemInfo?.uptime?.formatted ||
                       `${Math.floor((systemHealth.uptime || 0) / 3600)}h ${Math.floor(((systemHealth.uptime || 0) % 3600) / 60)}m`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-sm font-medium">
                      {systemHealth.healthChecks?.database?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Node Version</span>
                    <span className="text-sm font-medium">
                      {systemHealth.systemInfo?.nodeVersion || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Environment</span>
                    <span className="text-sm font-medium">
                      {systemHealth.systemInfo?.environment || 'Unknown'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">
                        {systemHealth.healthChecks?.memory?.usage || `${systemHealth.memoryUsage || 0}%`}
                      </span>
                    </div>
                    <Progress value={systemHealth.memoryUsage || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">CPU Load</span>
                      <span className="text-sm font-medium">
                        {systemHealth.cpuMetrics?.loadAverage?.[0]?.toFixed(2) || systemHealth.serverLoad || 0}%
                      </span>
                    </div>
                    <Progress value={systemHealth.serverLoad || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">CPU Cores</span>
                      <span className="text-sm font-medium">
                        {systemHealth.cpuMetrics?.cpuCount || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Platform</span>
                    <span className="text-sm font-medium">
                      {systemHealth.systemInfo?.platform || 'Unknown'} ({systemHealth.systemInfo?.architecture || 'Unknown'})
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
