"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { adminService, type PatientStatistics } from "@/services/admin.service"
import { Users, UserCheck, UserX, Heart, Activity, Building2 } from "lucide-react"

export function PatientStatisticsComponent() {
  const [statistics, setStatistics] = useState<PatientStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true)
        console.log("Fetching patient statistics...")
        
        const stats = await adminService.getPatientStatistics()
        console.log("Patient statistics loaded:", stats)
        
        setStatistics(stats)
      } catch (error) {
        console.error("Failed to fetch patient statistics:", error)
        toast({
          title: "Error",
          description: "Failed to load patient statistics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      'O+': 'bg-red-100 text-red-800',
      'O-': 'bg-red-200 text-red-900',
      'A+': 'bg-blue-100 text-blue-800',
      'A-': 'bg-blue-200 text-blue-900',
      'B+': 'bg-green-100 text-green-800',
      'B-': 'bg-green-200 text-green-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
    }
    return colors[bloodType] || 'bg-gray-100 text-gray-800'
  }

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'cardiology':
        return <Heart className="w-4 h-4" />
      case 'neurology':
        return <Activity className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.overview.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All patients in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statistics.overview.activePatients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((statistics.overview.activePatients / statistics.overview.totalPatients) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Patients</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statistics.overview.totalInactivePatients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((statistics.overview.totalInactivePatients / statistics.overview.totalPatients) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gender Distribution</CardTitle>
            <CardDescription>Patient breakdown by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.distributions.gender.map((item) => {
                const percentage = (item.count / statistics.overview.totalPatients) * 100
                return (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium capitalize">{item._id}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Blood Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blood Type Distribution</CardTitle>
            <CardDescription>Patient breakdown by blood type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statistics.distributions.bloodType.map((item) => {
                const percentage = (item.count / statistics.overview.totalPatients) * 100
                return (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getBloodTypeColor(item._id)}`}>
                        {item._id}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Department Distribution</CardTitle>
            <CardDescription>Patient breakdown by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.distributions.department.map((item) => {
                const percentage = (item.count / statistics.overview.totalPatients) * 100
                return (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getDepartmentIcon(item._id)}
                      <span className="text-sm font-medium capitalize">{item._id}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.count.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
          <CardDescription>Quick overview of patient demographics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {statistics.distributions.bloodType.find(b => b._id === 'O+')?.count || 0}
              </div>
              <div className="text-sm text-muted-foreground">Most Common Blood Type (O+)</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {statistics.distributions.department.reduce((max, dept) => 
                  dept.count > max.count ? dept : max, statistics.distributions.department[0]
                ).count}
              </div>
              <div className="text-sm text-muted-foreground">
                Largest Department ({statistics.distributions.department.reduce((max, dept) => 
                  dept.count > max.count ? dept : max, statistics.distributions.department[0]
                )._id})
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {((statistics.overview.activePatients / statistics.overview.totalPatients) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Active Patient Rate</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {statistics.distributions.gender.length}
              </div>
              <div className="text-sm text-muted-foreground">Gender Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
