'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Activity, 
  Clock, 
  Settings,
  RefreshCw,
  Bell,
  AlertTriangle
} from 'lucide-react'
import DoctorQueueDashboard from '@/components/doctor/DoctorQueueDashboard'
import QueueNotifications from '@/components/doctor/QueueNotifications'
import QueueTestPanel from '@/components/doctor/QueueTestPanel'
import { doctorService } from '@/services/doctor.service'
import webSocketService from '@/services/websocket.service'
import queueNotificationService from '@/services/queue-notification.service'
import { useToast } from '@/hooks/use-toast'

const DoctorQueuePage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Disconnected')
  const [doctorStatus, setDoctorStatus] = useState<any>(null)
  const [queueStats, setQueueStats] = useState<any>(null)
  const [doctorInfo, setDoctorInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    initializePage()
    
    return () => {
      // Cleanup on unmount
      webSocketService.disconnect()
    }
  }, [])

  const initializePage = async () => {
    try {
      // First get doctor info
      const doctor = await doctorService.getCurrentDoctor()
      setDoctorInfo(doctor)

      // Initialize WebSocket connection with real doctor ID
      await initializeWebSocket(doctor._id)

      // Load initial data
      await loadDoctorStatus()
      await loadQueueStats()

      // Request notification permission
      await queueNotificationService.requestNotificationPermission()

      setLoading(false)
    } catch (error) {
      console.error('Failed to initialize doctor queue page:', error)
      toast({
        title: "Initialization Error",
        description: "Failed to load queue dashboard. Please refresh the page.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const initializeWebSocket = async (doctorId?: string) => {
    try {
      // Use real doctor info
      const userRole = 'doctor'
      const userId = doctorId || doctorInfo?._id || 'doctor-123'

      await webSocketService.connect(userRole, userId)
      webSocketService.joinDoctorQueue(userId)
      
      setIsConnected(true)
      setConnectionStatus('Connected')
      
      // Set up WebSocket event listeners
      setupWebSocketListeners()
      
      console.log('WebSocket connected successfully')
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      setIsConnected(false)
      setConnectionStatus('Connection Failed')
    }
  }

  const setupWebSocketListeners = () => {
    // Listen for patient assignments
    webSocketService.on('patient_assigned', (data) => {
      console.log('Patient assigned:', data)
      loadDoctorStatus()
      loadQueueStats()
      
      toast({
        title: "New Patient Assigned",
        description: `${data.patient.name} has been assigned to you`,
      })
    })

    // Listen for patient status changes
    webSocketService.on('patient_status_changed', (data) => {
      console.log('Patient status changed:', data)
      loadDoctorStatus()
      loadQueueStats()
    })

    // Listen for capacity warnings
    webSocketService.on('capacity_warning', (data) => {
      console.log('Capacity warning:', data)
      toast({
        title: "Capacity Warning",
        description: data.message,
        variant: "destructive"
      })
    })

    // Listen for queue updates
    webSocketService.on('queue_status_update', (data) => {
      console.log('Queue status update:', data)
      setQueueStats(prev => ({ ...prev, ...data }))
    })

    // Listen for system notifications
    webSocketService.on('system_notification', (data) => {
      console.log('System notification:', data)
      if (data.priority === 'urgent' || data.priority === 'high') {
        toast({
          title: data.title,
          description: data.message,
          variant: data.type === 'error' ? 'destructive' : 'default'
        })
      }
    })
  }

  const loadDoctorStatus = async () => {
    try {
      const status = await doctorService.getDoctorStatus()
      setDoctorStatus(status)
    } catch (error) {
      console.error('Failed to load doctor status:', error)
    }
  }

  const loadQueueStats = async () => {
    try {
      const stats = await doctorService.getQueueStatus()
      setQueueStats(stats.data || stats) // Handle both response formats
    } catch (error) {
      console.error('Failed to load queue stats:', error)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await loadDoctorStatus()
    await loadQueueStats()
    setLoading(false)
    
    toast({
      title: "Refreshed",
      description: "Queue data has been updated",
    })
  }

  const handleGoOnline = async () => {
    try {
      await doctorService.updateDoctorStatus({
        isOnline: true,
        isAvailable: true,
        status: 'available'
      })
      await loadDoctorStatus()
      
      toast({
        title: "Status Updated",
        description: "You are now online and available for patients",
      })
    } catch (error) {
      console.error('Failed to go online:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleGoOffline = async () => {
    try {
      await doctorService.updateDoctorStatus({
        isOnline: false,
        isAvailable: false,
        status: 'offline'
      })
      await loadDoctorStatus()
      
      toast({
        title: "Status Updated",
        description: "You are now offline",
      })
    } catch (error) {
      console.error('Failed to go offline:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getConnectionStatusColor = () => {
    if (isConnected) return 'text-green-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading queue dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">
            Manage your patient queue and consultations
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm ${getConnectionStatusColor()}`}>
              {connectionStatus}
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <QueueNotifications />
            
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            {doctorStatus?.isOnline ? (
              <Button variant="outline" size="sm" onClick={handleGoOffline}>
                Go Offline
              </Button>
            ) : (
              <Button size="sm" onClick={handleGoOnline}>
                Go Online
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Overview Cards */}
      {doctorStatus && queueStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={doctorStatus.isOnline ? "default" : "secondary"}
                  className={doctorStatus.isOnline ? "bg-green-500" : ""}
                >
                  {doctorStatus.status.toUpperCase()}
                </Badge>
                {doctorStatus.isOnBreak && (
                  <Badge variant="outline">
                    On Break ({doctorStatus.breakTimeRemaining}m)
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {doctorStatus?.currentPatients || 0} / {doctorStatus?.maxPatients || 5}
              </div>
              <p className="text-xs text-muted-foreground">
                {doctorStatus?.capacity?.percentage?.toFixed(0) || 0}% capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.statistics?.totalWaiting || 0}</div>
              <p className="text-xs text-muted-foreground">
                Patients waiting
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.statistics?.averageWaitTime || 0}</div>
              <p className="text-xs text-muted-foreground">
                minutes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <DoctorQueueDashboard />

      {/* API Test Panel (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <QueueTestPanel />
      )}

      {/* Development Tools (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Development Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => webSocketService.simulatePatientAssigned('doctor-123')}
              >
                Simulate Patient Assignment
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => webSocketService.simulateQueueUpdate()}
              >
                Simulate Queue Update
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => webSocketService.simulateCapacityWarning('doctor-123')}
              >
                Simulate Capacity Warning
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => webSocketService.simulateSystemNotification()}
              >
                Simulate System Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DoctorQueuePage
