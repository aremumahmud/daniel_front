import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue and related data
const mockQueue = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()
const mockDoctorStatus = new Map()

// Initialize mock patients
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001",
  age: 22,
  department: "Computer Science"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  matricNumber: "2024/ENG/002",
  age: 21,
  department: "Engineering"
})

mockPatients.set("770g0622-g4bd-63f6-c938-668877662333", {
  id: "770g0622-g4bd-63f6-c938-668877662333",
  firstName: "Michael",
  lastName: "Johnson",
  matricNumber: "2024/MED/003",
  age: 23,
  department: "Medicine"
})

// Initialize mock doctors
mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Dr. John",
  lastName: "Smith",
  specialization: "Cardiology",
  maxPatients: 5
})

// Initialize doctor status
mockDoctorStatus.set("770g0622-g4bd-63f6-c938-668877662222", {
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  isOnline: true,
  isAvailable: true,
  status: "available",
  currentPatients: 2,
  maxPatients: 5
})

// Initialize comprehensive queue entries
const queueEntries = [
  {
    _id: "queue-001",
    patientId: "550e8400-e29b-41d4-a716-446655440000",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    position: 1,
    priority: "medium",
    status: "assigned",
    reason: "Routine checkup",
    symptoms: ["headache", "fatigue"],
    queuedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    assignedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    estimatedDuration: 30,
    type: "consultation"
  },
  {
    _id: "queue-002",
    patientId: "660f9511-f3ac-52e5-b827-557766551111",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    position: 2,
    priority: "high",
    status: "in-consultation",
    reason: "Follow-up consultation",
    symptoms: ["back pain"],
    queuedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    assignedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    estimatedDuration: 25,
    type: "follow-up",
    consultationStartTime: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    _id: "queue-003",
    patientId: "770g0622-g4bd-63f6-c938-668877662333",
    doctorId: null,
    position: 3,
    priority: "low",
    status: "waiting",
    reason: "General consultation",
    symptoms: ["minor cough"],
    queuedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    assignedAt: null,
    estimatedDuration: 20,
    type: "consultation"
  }
]

// Initialize queue
queueEntries.forEach(entry => {
  mockQueue.set(entry._id, entry)
})

function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const includeAssigned = searchParams.get('includeAssigned') === 'true'
    const priority = searchParams.get('priority')
    const status = searchParams.get('status')

    // Get all queue entries
    let allQueueEntries = Array.from(mockQueue.values())

    // Filter by status if specified
    if (status) {
      allQueueEntries = allQueueEntries.filter((entry: any) => entry.status === status)
    }

    // Filter by priority if specified
    if (priority) {
      allQueueEntries = allQueueEntries.filter((entry: any) => entry.priority === priority)
    }

    // Exclude assigned patients unless specifically requested
    if (!includeAssigned) {
      allQueueEntries = allQueueEntries.filter((entry: any) => 
        entry.status !== 'assigned' && entry.status !== 'in-consultation'
      )
    }

    // Sort by priority and queue time
    allQueueEntries.sort((a: any, b: any) => {
      // Priority order: emergency > high > medium > low
      const priorityOrder = { 'emergency': 0, 'high': 1, 'medium': 2, 'low': 3 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Then by queue time (earlier first)
      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
    })

    // Format queue data
    const formattedQueue = allQueueEntries.map((entry: any) => {
      const patient = mockPatients.get(entry.patientId)
      const doctor = entry.doctorId ? mockDoctors.get(entry.doctorId) : null
      const waitTime = Math.floor((Date.now() - new Date(entry.queuedAt).getTime()) / (1000 * 60))

      return {
        queueId: entry._id,
        patientId: entry.patientId,
        patient: patient ? {
          firstName: patient.firstName,
          lastName: patient.lastName,
          matricNumber: patient.matricNumber,
          age: patient.age,
          department: patient.department
        } : null,
        doctorId: entry.doctorId,
        doctor: doctor ? {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialization: doctor.specialization
        } : null,
        position: entry.position,
        priority: entry.priority,
        status: entry.status,
        reason: entry.reason,
        symptoms: entry.symptoms || [],
        type: entry.type,
        queuedAt: entry.queuedAt,
        assignedAt: entry.assignedAt,
        consultationStartTime: entry.consultationStartTime,
        estimatedDuration: entry.estimatedDuration,
        waitTime,
        waitTimeDisplay: `${waitTime} min`
      }
    })

    // Calculate statistics
    const statistics = {
      totalInQueue: allQueueEntries.length,
      totalWaiting: allQueueEntries.filter((e: any) => e.status === 'waiting').length,
      totalAssigned: allQueueEntries.filter((e: any) => e.status === 'assigned').length,
      totalInConsultation: allQueueEntries.filter((e: any) => e.status === 'in-consultation').length,
      totalCompleted: allQueueEntries.filter((e: any) => e.status === 'completed').length,
      averageWaitTime: formattedQueue.length > 0 ? 
        Math.round(formattedQueue.reduce((sum, entry) => sum + entry.waitTime, 0) / formattedQueue.length) : 0,
      priorityDistribution: {
        emergency: allQueueEntries.filter((e: any) => e.priority === 'emergency').length,
        high: allQueueEntries.filter((e: any) => e.priority === 'high').length,
        medium: allQueueEntries.filter((e: any) => e.priority === 'medium').length,
        low: allQueueEntries.filter((e: any) => e.priority === 'low').length
      },
      typeDistribution: allQueueEntries.reduce((acc: any, entry: any) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1
        return acc
      }, {})
    }

    // Get doctor availability
    const availableDoctors = Array.from(mockDoctorStatus.values())
      .filter((status: any) => status.isOnline && status.isAvailable)
      .map((status: any) => {
        const doctor = mockDoctors.get(status.doctorId)
        return {
          doctorId: status.doctorId,
          doctor: doctor ? {
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            specialization: doctor.specialization
          } : null,
          currentPatients: status.currentPatients,
          maxPatients: status.maxPatients,
          availableSlots: status.maxPatients - status.currentPatients,
          utilizationPercentage: (status.currentPatients / status.maxPatients) * 100
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        queue: formattedQueue,
        statistics,
        availableDoctors,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error getting queue status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get queue status",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
