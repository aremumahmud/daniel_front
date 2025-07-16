'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  UserCheck,
  Activity,
  Settings,
  Bell,
  RefreshCw
} from 'lucide-react'
import PatientQueueCard from './PatientQueueCard'
import DoctorStatusPanel from './DoctorStatusPanel'
import QueueStatistics from './QueueStatistics'
import CapacityManagement from './CapacityManagement'
import webSocketService from '@/services/websocket.service'
import queueNotificationService from '@/services/queue-notification.service'
import { doctorService } from '@/services/doctor.service'

interface Patient {
  queueId: string
  patientId: string
  patientName: string
  status: string
  priority: 'emergency' | 'high' | 'medium' | 'low'
  reason: string
  assignedAt: string
  timeInQueue: number
  // Optional fields that might come from API
  symptoms?: string[]
  type?: string
  position?: number
  queuedAt?: string
  consultationStartTime?: string
  estimatedDuration?: number
  waitTime?: number
  waitTimeDisplay?: string
}

interface DoctorStatus {
  doctorId: string
  isOnline: boolean
  isAvailable: boolean
  status: string
  currentPatients: number
  maxPatients: number
  capacity: {
    current: number
    maximum: number
    percentage: number
    availabilityStatus: string
  }
  isOnBreak: boolean
  breakTimeRemaining: number
}

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

const DoctorQueueDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([])
  const [doctorStatus, setDoctorStatus] = useState<DoctorStatus | null>(null)
  const [statistics, setStatistics] = useState<QueueStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('current')
  const [notifications, setNotifications] = useState<any[]>([])
  const [doctorInfo, setDoctorInfo] = useState<any>(null)

  // Initialize WebSocket connection and load data
  useEffect(() => {
    initializeData()
    setupNotificationListeners()

    // Set up periodic refresh
    const interval = setInterval(() => {
      loadDoctorQueue()
      loadDoctorStatus()
    }, 30000) // Refresh every 30 seconds

    return () => {
      clearInterval(interval)
      webSocketService.disconnect()
    }
  }, [])

  const initializeData = async () => {
    try {
      // First get doctor info
      const doctor = await doctorService.getCurrentDoctor()
      setDoctorInfo(doctor)

      // Then initialize connection with real doctor ID
      await initializeConnection(doctor._id)

      // Load queue and status data
      await loadDoctorQueue()
      await loadDoctorStatus()
    } catch (error) {
      console.error('Failed to initialize data:', error)
    }
  }

  const initializeConnection = async (doctorId?: string) => {
    try {
      // Use real doctor info
      const userRole = 'doctor'
      const userId = doctorId || doctorInfo?._id || 'doctor-123'

      await webSocketService.connect(userRole, userId)
      webSocketService.joinDoctorQueue(userId)
      
      // Request notification permission
      await queueNotificationService.requestNotificationPermission()
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error)
    }
  }

  const setupNotificationListeners = () => {
    // Listen for new patient assignments
    webSocketService.on('patient_assigned', (data) => {
      console.log('New patient assigned:', data)
      loadDoctorQueue() // Refresh queue
      
      // Show notification
      queueNotificationService.on('notification_added', (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10
      })
    })

    // Listen for patient status changes
    webSocketService.on('patient_status_changed', (data) => {
      console.log('Patient status changed:', data)
      loadDoctorQueue() // Refresh queue
    })

    // Listen for capacity warnings
    webSocketService.on('capacity_warning', (data) => {
      console.log('Capacity warning:', data)
      // Handle capacity warning UI
    })
  }

  const loadDoctorQueue = async () => {
    try {
      // Use the doctor service to get current patients
      const response = await doctorService.getCurrentPatients()

      if (response && response.data && response.data.patients) {
        const realPatients = response.data.patients

        // Transform real API data to match our interface
        const transformedPatients: Patient[] = realPatients.map((patient: any) => ({
          queueId: patient.queueId,
          patientId: patient.patientId,
          patientName: patient.patientName,
          status: patient.status,
          priority: patient.priority,
          reason: patient.reason,
          assignedAt: patient.assignedAt,
          timeInQueue: patient.timeInQueue,
          // Add computed fields
          waitTime: Math.floor(patient.timeInQueue / 60), // Convert seconds to minutes
          waitTimeDisplay: `${Math.floor(patient.timeInQueue / 60)} min`,
          symptoms: [], // Default empty array
          type: 'consultation', // Default type
          position: 0, // Will be set based on array index
          estimatedDuration: 30 // Default duration
        }))

        setPatients(transformedPatients)

        // Separate patients by status
        const currentPatient = transformedPatients.find(p => p.status === 'in-consultation')
        const assignedPatients = transformedPatients.filter(p => p.status === 'assigned')

        setCurrentPatient(currentPatient || null)
        setAssignedPatients(assignedPatients)

        // Calculate statistics from real data
        const priorityDistribution = transformedPatients.reduce((acc: any, p) => {
          acc[p.priority] = (acc[p.priority] || 0) + 1
          return acc
        }, { emergency: 0, high: 0, medium: 0, low: 0 })

        setStatistics({
          totalInQueue: response.data.count,
          totalWaiting: 0,
          totalAssigned: assignedPatients.length,
          totalInConsultation: currentPatient ? 1 : 0,
          averageWaitTime: transformedPatients.length > 0 ?
            Math.round(transformedPatients.reduce((sum, p) => sum + p.waitTime!, 0) / transformedPatients.length) : 0,
          priorityDistribution
        })

        return
      }

      // Fallback to mock data if API fails
      const mockPatients: Patient[] = [
        {
          queueId: 'queue-001',
          patientId: 'patient-001',
          patient: {
            firstName: 'John',
            lastName: 'Doe',
            matricNumber: '2024/CS/001',
            age: 22,
            department: 'Computer Science'
          },
          status: 'in-consultation',
          priority: 'medium',
          reason: 'Routine checkup',
          symptoms: ['headache', 'fatigue'],
          type: 'consultation',
          position: 1,
          queuedAt: new Date(Date.now() - 45 * 60000).toISOString(),
          assignedAt: new Date(Date.now() - 15 * 60000).toISOString(),
          consultationStartTime: new Date(Date.now() - 5 * 60000).toISOString(),
          estimatedDuration: 30,
          waitTime: 45,
          waitTimeDisplay: '45 min'
        },
        {
          queueId: 'queue-002',
          patientId: 'patient-002',
          patient: {
            firstName: 'Jane',
            lastName: 'Smith',
            matricNumber: '2024/ENG/002',
            age: 21,
            department: 'Engineering'
          },
          status: 'assigned',
          priority: 'high',
          reason: 'Follow-up consultation',
          symptoms: ['back pain'],
          type: 'follow-up',
          position: 2,
          queuedAt: new Date(Date.now() - 30 * 60000).toISOString(),
          assignedAt: new Date(Date.now() - 10 * 60000).toISOString(),
          estimatedDuration: 25,
          waitTime: 30,
          waitTimeDisplay: '30 min'
        }
      ]

      setPatients(mockPatients)
      setCurrentPatient(mockPatients.find(p => p.status === 'in-consultation') || null)
      setAssignedPatients(mockPatients.filter(p => p.status === 'assigned'))
      
      // Mock statistics
      setStatistics({
        totalInQueue: mockPatients.length,
        totalWaiting: 0,
        totalAssigned: mockPatients.filter(p => p.status === 'assigned').length,
        totalInConsultation: mockPatients.filter(p => p.status === 'in-consultation').length,
        averageWaitTime: 37,
        priorityDistribution: {
          emergency: 0,
          high: 1,
          medium: 1,
          low: 0
        }
      })
      
    } catch (error) {
      console.error('Failed to load doctor queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDoctorStatus = async () => {
    try {
      // Use the doctor service to get status
      const response = await doctorService.getDoctorStatus()

      if (response) {
        setDoctorStatus(response)
        return
      }

      // Fallback to mock data if API fails
      const mockStatus: DoctorStatus = {
        doctorId: 'doctor-123',
        isOnline: true,
        isAvailable: true,
        status: 'available',
        currentPatients: 2,
        maxPatients: 5,
        capacity: {
          current: 2,
          maximum: 5,
          percentage: 40,
          availabilityStatus: 'available'
        },
        isOnBreak: false,
        breakTimeRemaining: 0
      }

      setDoctorStatus(mockStatus)
    } catch (error) {
      console.error('Failed to load doctor status:', error)
    }
  }

  const handlePatientStatusUpdate = async (queueId: string, newStatus: string, data?: any) => {
    try {
      // Use the doctor service to update patient status
      await doctorService.updatePatientStatus(queueId, {
        status: newStatus,
        ...data
      })

      console.log('Patient status updated successfully:', { queueId, newStatus, data })

      // Refresh queue after update
      await loadDoctorQueue()
      await loadDoctorStatus()

    } catch (error) {
      console.error('Failed to update patient status:', error)
      // You could show a toast notification here
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    loadDoctorQueue()
    loadDoctorStatus()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading queue...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your patient queue and consultations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications ({notifications.length})
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Doctor Status Panel */}
      {doctorStatus && (
        <DoctorStatusPanel 
          status={doctorStatus}
          onStatusUpdate={loadDoctorStatus}
        />
      )}

      {/* Statistics Cards */}
      {statistics && (
        <QueueStatistics statistics={statistics} />
      )}

      {/* Main Queue Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">
            <UserCheck className="h-4 w-4 mr-2" />
            Current Patient
          </TabsTrigger>
          <TabsTrigger value="assigned">
            <Users className="h-4 w-4 mr-2" />
            Assigned Patients ({assignedPatients.length})
          </TabsTrigger>
          <TabsTrigger value="capacity">
            <Activity className="h-4 w-4 mr-2" />
            Capacity Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentPatient ? (
            <PatientQueueCard
              patient={currentPatient}
              onStatusUpdate={handlePatientStatusUpdate}
              isCurrentPatient={true}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No patient currently in consultation</p>
                  <p className="text-sm text-muted-foreground">
                    Assign a patient from your queue to start
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          {assignedPatients.length > 0 ? (
            <div className="grid gap-4">
              {assignedPatients.map((patient) => (
                <PatientQueueCard
                  key={patient.queueId}
                  patient={patient}
                  onStatusUpdate={handlePatientStatusUpdate}
                  isCurrentPatient={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No patients assigned</p>
                  <p className="text-sm text-muted-foreground">
                    Check the main queue for available patients
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          {doctorStatus && (
            <CapacityManagement 
              status={doctorStatus}
              onUpdate={loadDoctorStatus}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DoctorQueueDashboard
