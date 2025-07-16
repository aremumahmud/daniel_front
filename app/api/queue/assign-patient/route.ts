import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue and related data (shared with other queue APIs)
const mockQueue = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()
const mockDoctorStatus = new Map()

// Initialize mock data
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

mockDoctors.set("880h1733-h5ce-74g7-d049-779988773333", {
  id: "880h1733-h5ce-74g7-d049-779988773333",
  firstName: "Dr. Sarah",
  lastName: "Johnson",
  specialization: "Internal Medicine",
  maxPatients: 6
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

mockDoctorStatus.set("880h1733-h5ce-74g7-d049-779988773333", {
  doctorId: "880h1733-h5ce-74g7-d049-779988773333",
  isOnline: true,
  isAvailable: true,
  status: "available",
  currentPatients: 1,
  maxPatients: 6
})

// Initialize queue entries
mockQueue.set("queue-003", {
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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { queueId } = body

    // Validate required fields
    if (!queueId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required field: queueId",
          error: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    // Get doctor ID from token
    const doctorId = user.userId || user.id

    // Get queue entry
    const queueEntry = mockQueue.get(queueId)
    if (!queueEntry) {
      return NextResponse.json(
        {
          success: false,
          message: "Queue entry not found",
          error: "QUEUE_ENTRY_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Check if patient is already assigned
    if (queueEntry.status !== 'waiting') {
      return NextResponse.json(
        {
          success: false,
          message: `Patient is already ${queueEntry.status}`,
          error: "PATIENT_NOT_AVAILABLE"
        },
        { status: 400 }
      )
    }

    // Get doctor info
    const doctor = mockDoctors.get(doctorId)
    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor not found",
          error: "DOCTOR_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Get doctor status
    const doctorStatus = mockDoctorStatus.get(doctorId)
    if (!doctorStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor status not found",
          error: "DOCTOR_STATUS_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Check if doctor is available
    if (!doctorStatus.isOnline || !doctorStatus.isAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor is not available for new patients",
          error: "DOCTOR_NOT_AVAILABLE"
        },
        { status: 400 }
      )
    }

    // Check doctor capacity
    if (doctorStatus.currentPatients >= doctorStatus.maxPatients) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor is at maximum capacity",
          error: "DOCTOR_AT_CAPACITY"
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Update queue entry
    const updatedQueueEntry = {
      ...queueEntry,
      doctorId,
      status: 'assigned',
      assignedAt: now,
      updatedAt: now,
      statusHistory: [
        ...(queueEntry.statusHistory || []),
        {
          status: 'assigned',
          timestamp: now,
          updatedBy: doctorId,
          notes: `Assigned to ${doctor.firstName} ${doctor.lastName}`
        }
      ]
    }

    // Update doctor's current patient count
    const updatedDoctorStatus = {
      ...doctorStatus,
      currentPatients: doctorStatus.currentPatients + 1,
      lastActivity: now,
      updatedAt: now
    }

    // Store updates
    mockQueue.set(queueId, updatedQueueEntry)
    mockDoctorStatus.set(doctorId, updatedDoctorStatus)

    // Get patient info for response
    const patient = mockPatients.get(queueEntry.patientId)

    // Calculate wait time
    const waitTime = Math.floor((Date.now() - new Date(queueEntry.queuedAt).getTime()) / (1000 * 60))

    const responseData = {
      queueId,
      patientId: queueEntry.patientId,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber,
        age: patient.age,
        department: patient.department
      } : null,
      doctorId,
      doctor: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      },
      status: 'assigned',
      priority: queueEntry.priority,
      reason: queueEntry.reason,
      symptoms: queueEntry.symptoms || [],
      type: queueEntry.type,
      position: queueEntry.position,
      queuedAt: queueEntry.queuedAt,
      assignedAt: now,
      estimatedDuration: queueEntry.estimatedDuration,
      waitTime,
      waitTimeDisplay: `${waitTime} min`,
      doctorCapacity: {
        current: updatedDoctorStatus.currentPatients,
        maximum: updatedDoctorStatus.maxPatients,
        remaining: updatedDoctorStatus.maxPatients - updatedDoctorStatus.currentPatients,
        percentage: (updatedDoctorStatus.currentPatients / updatedDoctorStatus.maxPatients) * 100
      }
    }

    return NextResponse.json({
      success: true,
      message: `Patient successfully assigned to ${doctor.firstName} ${doctor.lastName}`,
      data: responseData
    })

  } catch (error) {
    console.error('Error assigning patient:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign patient",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
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

    // Get available patients for assignment
    const availablePatients = Array.from(mockQueue.values())
      .filter((entry: any) => entry.status === 'waiting')
      .sort((a: any, b: any) => {
        // Sort by priority first, then by queue time
        const priorityOrder = { 'emergency': 0, 'high': 1, 'medium': 2, 'low': 3 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
      })
      .map((entry: any) => {
        const patient = mockPatients.get(entry.patientId)
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
          priority: entry.priority,
          reason: entry.reason,
          symptoms: entry.symptoms || [],
          type: entry.type,
          position: entry.position,
          queuedAt: entry.queuedAt,
          estimatedDuration: entry.estimatedDuration,
          waitTime,
          waitTimeDisplay: `${waitTime} min`
        }
      })

    // Get available doctors
    const availableDoctors = Array.from(mockDoctorStatus.values())
      .filter((status: any) => status.isOnline && status.isAvailable && status.currentPatients < status.maxPatients)
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
        availablePatients,
        availableDoctors,
        assignmentGuidelines: {
          priorityOrder: ['emergency', 'high', 'medium', 'low'],
          assignmentRules: [
            "Emergency patients should be assigned immediately",
            "Assign patients based on priority and wait time",
            "Consider doctor specialization for specific cases",
            "Respect doctor capacity limits"
          ]
        }
      }
    })

  } catch (error) {
    console.error('Error getting assignment data:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get assignment data",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
