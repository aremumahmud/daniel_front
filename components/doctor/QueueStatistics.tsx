'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Clock, 
  UserCheck,
  Activity,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from 'lucide-react'

interface QueueStatistics {
  totalInQueue: number
  totalWaiting: number
  totalAssigned: number
  totalInConsultation: number
  averageWaitTime: number
  priorityDistribution: {
    emergency: number
    high: number
    medium: number
    low: number
  }
}

interface QueueStatisticsProps {
  statistics: QueueStatistics
}

const QueueStatistics: React.FC<QueueStatisticsProps> = ({ statistics }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const totalPriorityPatients = Object.values(statistics.priorityDistribution).reduce((sum, count) => sum + count, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Patients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalInQueue || 0}</div>
          <p className="text-xs text-muted-foreground">
            In your queue
          </p>
        </CardContent>
      </Card>

      {/* In Consultation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Consultation</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{statistics.totalInConsultation}</div>
          <p className="text-xs text-muted-foreground">
            Currently active
          </p>
        </CardContent>
      </Card>

      {/* Assigned Patients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assigned</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{statistics.totalAssigned}</div>
          <p className="text-xs text-muted-foreground">
            Waiting to start
          </p>
        </CardContent>
      </Card>

      {/* Average Wait Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{statistics.averageWaitTime}</div>
          <p className="text-xs text-muted-foreground">
            minutes
          </p>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Priority Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Priority Badges */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(statistics.priorityDistribution).map(([priority, count]) => (
                <Badge 
                  key={priority} 
                  className={`${getPriorityColor(priority)} flex items-center space-x-1`}
                >
                  <span className="capitalize">{priority}</span>
                  <span>({count})</span>
                </Badge>
              ))}
            </div>

            {/* Priority Bars */}
            <div className="space-y-3">
              {Object.entries(statistics.priorityDistribution).map(([priority, count]) => {
                const percentage = totalPriorityPatients > 0 ? (count / totalPriorityPatients) * 100 : 0
                return (
                  <div key={priority} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{priority}</span>
                      <span className="text-muted-foreground">{count} patients ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          priority === 'emergency' ? 'bg-red-500' :
                          priority === 'high' ? 'bg-orange-500' :
                          priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Insights */}
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm">
                {statistics.priorityDistribution.emergency > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{statistics.priorityDistribution.emergency} emergency case(s) require immediate attention</span>
                  </div>
                )}
                {statistics.priorityDistribution.emergency === 0 && statistics.priorityDistribution.high > 0 && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>{statistics.priorityDistribution.high} high priority case(s) in queue</span>
                  </div>
                )}
                {statistics.priorityDistribution.emergency === 0 && statistics.priorityDistribution.high === 0 && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <UserCheck className="h-4 w-4" />
                    <span>No urgent cases - normal queue flow</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QueueStatistics
