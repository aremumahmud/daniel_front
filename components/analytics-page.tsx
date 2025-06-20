"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, Line, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { adminService } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"
import type { AdminAnalytics } from "@/lib/types/api"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

export function AnalyticsPage() {
  const [adminOverview, setAdminOverview] = useState<any>(null)
  const [userAnalytics, setUserAnalytics] = useState<any>(null)
  const [appointmentAnalytics, setAppointmentAnalytics] = useState<any>(null)
  const [patientStatistics, setPatientStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month")

  useEffect(() => {
    loadAllAnalytics()
  }, [period])

  const loadAllAnalytics = async () => {
    try {
      setLoading(true)

      // Load all analytics data in parallel using the new API endpoints
      const [
        overviewData,
        userAnalyticsData,
        appointmentAnalyticsData,
        patientStatsData
      ] = await Promise.allSettled([
        adminService.getAdminOverview(),
        adminService.getUserAnalytics({ period }),
        adminService.getAppointmentAnalytics({ period }),
        adminService.getPatientStatistics()
      ])

      if (overviewData.status === 'fulfilled') {
        setAdminOverview(overviewData.value)
      }

      if (userAnalyticsData.status === 'fulfilled') {
        setUserAnalytics(userAnalyticsData.value)
      }

      if (appointmentAnalyticsData.status === 'fulfilled') {
        setAppointmentAnalytics(appointmentAnalyticsData.value)
      }

      if (patientStatsData.status === 'fulfilled') {
        setPatientStatistics(patientStatsData.value)
      }

    } catch (error) {
      console.error("Failed to load analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getMonthlyUsageData = () => {
    // Use user growth data as a proxy for monthly usage since the old systemUsage endpoint doesn't exist
    if (!userAnalytics?.userGrowth) {
      return {
        labels: [],
        datasets: []
      }
    }

    const labels = userAnalytics.userGrowth.map((item: any) => {
      if (item._id.month && item._id.year) {
        return `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      }
      return `${item._id.year || 'Unknown'}`
    })

    return {
      labels,
      datasets: [
        {
          label: "New User Registrations",
          data: userAnalytics.userGrowth.map((item: any) => item.count || (item.patients + item.doctors)),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    }
  }

  const getUserDistributionData = () => {
    // Use userAnalytics overview data or adminOverview quickStats
    const overview = userAnalytics?.overview || adminOverview?.quickStats
    if (!overview) {
      return {
        labels: [],
        datasets: []
      }
    }

    return {
      labels: ["Patients", "Doctors", "Admins"],
      datasets: [
        {
          data: [
            overview.totalPatients || 0,
            overview.totalDoctors || 0,
            overview.totalAdmins || 0
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)"
          ],
          borderWidth: 2,
        },
      ],
    }
  }

  const getRecordsPerMonthData = () => {
    // Use patient statistics as a proxy for records created since the old recordsCreated endpoint doesn't exist
    if (!userAnalytics?.userGrowth) {
      return {
        labels: [],
        datasets: []
      }
    }

    const labels = userAnalytics.userGrowth.map((item: any) => {
      if (item._id.month && item._id.year) {
        return `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      }
      return `${item._id.year || 'Unknown'}`
    })

    return {
      labels,
      datasets: [
        {
          label: "Patient Records Created",
          data: userAnalytics.userGrowth.map((item: any) => item.patients || 0),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  const getAppointmentTrendsData = () => {
    if (!appointmentAnalytics?.monthlyTrends) {
      return {
        labels: [],
        datasets: []
      }
    }

    return {
      labels: appointmentAnalytics.monthlyTrends.map((item: any) => item.month),
      datasets: [
        {
          label: "Scheduled",
          data: appointmentAnalytics.monthlyTrends.map((item: any) => item.scheduled),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          tension: 0.1,
          fill: true,
        },
        {
          label: "Completed",
          data: appointmentAnalytics.monthlyTrends.map((item: any) => item.completed),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.1,
          fill: true,
        },
        {
          label: "Cancelled",
          data: appointmentAnalytics.monthlyTrends.map((item: any) => item.cancelled),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.1,
          fill: true,
        },
      ],
    }
  }

  const getUserGrowthData = () => {
    if (!userAnalytics?.userGrowth) {
      return {
        labels: [],
        datasets: []
      }
    }

    // Transform the new API format to chart format
    const labels = userAnalytics.userGrowth.map((item: any) => {
      if (item._id.month && item._id.year) {
        return `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      }
      return `${item._id.year || 'Unknown'}`
    })

    return {
      labels,
      datasets: [
        {
          label: 'Patients',
          data: userAnalytics.userGrowth.map((item: any) => item.patients),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1,
          fill: true,
        },
        {
          label: 'Doctors',
          data: userAnalytics.userGrowth.map((item: any) => item.doctors),
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          tension: 0.1,
          fill: true,
        },
      ],
    }
  }

  const getPatientBloodTypeData = () => {
    if (!patientStatistics?.distributions?.bloodType) {
      return {
        labels: [],
        datasets: []
      }
    }

    return {
      labels: patientStatistics.distributions.bloodType.map((item: any) => item._id),
      datasets: [
        {
          data: patientStatistics.distributions.bloodType.map((item: any) => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select value={period} onValueChange={(value: "day" | "week" | "month" | "year") => setPeriod(value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {patientStatistics?.overview?.totalPatients ||
               userAnalytics?.overview?.totalPatients ||
               adminOverview?.quickStats?.totalPatients || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {patientStatistics?.overview?.activePatients || userAnalytics?.overview?.activeUsers || 0} active •
              +{userAnalytics?.newRegistrations?.patients || adminOverview?.quickStats?.newPatientsToday || 0} new
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {userAnalytics?.overview?.totalDoctors || adminOverview?.quickStats?.totalDoctors || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Healthcare providers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {appointmentAnalytics?.totalAppointments || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {appointmentAnalytics?.completedAppointments || 0} completed •
              {appointmentAnalytics?.pendingAppointments || 0} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {userAnalytics?.overview?.totalUsers || adminOverview?.quickStats?.totalUsers || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {userAnalytics?.overview?.activeUsers || 0} active •
              {userAnalytics?.overview?.verifiedUsers || 0} verified
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={getUserGrowthData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Patient and Doctor Registration Growth'
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Enhanced Appointment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={getAppointmentTrendsData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Scheduled vs Completed vs Cancelled'
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Patient Blood Type Distribution */}
        {patientStatistics && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Blood Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut
                data={getPatientBloodTypeData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                    title: {
                      display: true,
                      text: 'Blood Type Breakdown'
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut
              data={getUserDistributionData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                  title: {
                    display: true,
                    text: 'Patients vs Doctors vs Admins'
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* System Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly System Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Line
              data={getMonthlyUsageData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'User Login Activity'
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Records Created */}
        <Card>
          <CardHeader>
            <CardTitle>Records Created per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={getRecordsPerMonthData()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Medical Records Creation Trends'
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      {appointmentAnalytics?.departmentBreakdown && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {appointmentAnalytics.departmentBreakdown.map((dept: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold capitalize">{dept.department}</h3>
                  <p className="text-2xl font-bold text-primary">{dept.count}</p>
                  <p className="text-sm text-muted-foreground">{dept.percentage}% of total appointments</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {userAnalytics?.demographics && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Age Groups */}
              {userAnalytics.demographics.ageGroups && (
                <div>
                  <h3 className="font-semibold mb-3">Age Distribution</h3>
                  <div className="space-y-2">
                    {userAnalytics.demographics.ageGroups.map((group: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{group.range}</span>
                        <span className="font-medium">{group.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gender Distribution */}
              {userAnalytics.demographics.genderDistribution && (
                <div>
                  <h3 className="font-semibold mb-3">Gender Distribution</h3>
                  <div className="space-y-2">
                    {userAnalytics.demographics.genderDistribution.map((gender: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{gender.gender}</span>
                        <span className="font-medium">{gender.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
