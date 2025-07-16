import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue and patient data (shared with other queue APIs)
const mockQueue = new Map()
const mockPatients = new Map()
const mockDoctorStatus = new Map()

// Initialize mock data
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  matricNumber: "2024/ENG/002"
})

// Initialize mock queue entries
mockQueue.set("queue-001", {
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
  type: "consultation",
  notes: "Patient reports mild symptoms",
  consultationStartTime: null,
  consultationEndTime: null,
  consultationSummary: null,
  statusHistory: [
    {
      status: "waiting",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      updatedBy: "system"
    },
    {
      status: "assigned",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      updatedBy: "system"
    }
  ]
})

// Initialize doctor status
mockDoctorStatus.set("770g0622-g4bd-63f6-c938-668877662222", {
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  currentPatients: 2,
  maxPatients: 5
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { queueId: string } }
) {
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

    const { queueId } = params
    const body = await request.json()
    const {
      status,
      notes,
      startTime,
      completedAt,
      consultationSummary
    } = body

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Status is required",
          error: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    // Validate status values
    const validStatuses = ['assigned', 'in-consultation', 'completed', 'cancelled', 'no-show']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          error: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

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

    const doctorId = user.userId || user.id

    // Verify doctor owns this patient
    if (queueEntry.doctorId !== doctorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. You can only update your own patients.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      )
    }

    const now = new Date().toISOString()
    const currentStatus = queueEntry.status

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      'assigned': ['in-consultation', 'cancelled', 'no-show'],
      'in-consultation': ['completed', 'cancelled'],
      'completed': [], // Cannot change from completed
      'cancelled': [], // Cannot change from cancelled
      'no-show': [] // Cannot change from no-show
    }

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status transition from '${currentStatus}' to '${status}'`,
          error: "INVALID_TRANSITION"
        },
        { status: 400 }
      )
    }

    // Prepare updated queue entry
    const updatedEntry = {
      ...queueEntry,
      status,
      notes: notes || queueEntry.notes,
      updatedAt: now,
      statusHistory: [
        ...queueEntry.statusHistory,
        {
          status,
          timestamp: now,
          updatedBy: doctorId,
          notes: notes || ""
        }
      ]
    }

    // Handle specific status updates
    switch (status) {
      case 'in-consultation':
        updatedEntry.consultationStartTime = startTime || now
        break

      case 'completed':
        if (!queueEntry.consultationStartTime) {
          return NextResponse.json(
            {
              success: false,
              message: "Cannot complete consultation that was never started",
              error: "CONSULTATION_NOT_STARTED"
            },
            { status: 400 }
          )
        }

        updatedEntry.consultationEndTime = completedAt || now

        // Calculate actual consultation duration
        const startTimeMs = new Date(queueEntry.consultationStartTime).getTime()
        const endTimeMs = new Date(updatedEntry.consultationEndTime).getTime()
        updatedEntry.actualDuration = Math.floor((endTimeMs - startTimeMs) / (1000 * 60))

        // Store consultation summary if provided
        if (consultationSummary) {
          updatedEntry.consultationSummary = {
            diagnosis: consultationSummary.diagnosis || "",
            treatment: consultationSummary.treatment || "",
            followUp: consultationSummary.followUp || "",
            prescriptions: consultationSummary.prescriptions || [],
            notes: consultationSummary.notes || "",
            completedBy: doctorId,
            completedAt: updatedEntry.consultationEndTime
          }
        }

        // Update doctor's current patient count
        const doctorStatus = mockDoctorStatus.get(doctorId)
        if (doctorStatus) {
          doctorStatus.currentPatients = Math.max(0, doctorStatus.currentPatients - 1)
          mockDoctorStatus.set(doctorId, doctorStatus)
        }
        break

      case 'cancelled':
      case 'no-show':
        // Update doctor's current patient count
        const doctorStatusForCancel = mockDoctorStatus.get(doctorId)
        if (doctorStatusForCancel) {
          doctorStatusForCancel.currentPatients = Math.max(0, doctorStatusForCancel.currentPatients - 1)
          mockDoctorStatus.set(doctorId, doctorStatusForCancel)
        }
        break
    }

    // Store updated entry
    mockQueue.set(queueId, updatedEntry)

    // Get patient info for response
    const patient = mockPatients.get(queueEntry.patientId)

    // Calculate metrics
    const waitTime = queueEntry.queuedAt ?
      Math.floor((Date.now() - new Date(queueEntry.queuedAt).getTime()) / (1000 * 60)) : 0

    const consultationTime = updatedEntry.consultationStartTime ?
      Math.floor((Date.now() - new Date(updatedEntry.consultationStartTime).getTime()) / (1000 * 60)) : 0

    const responseData = {
      queueId,
      patientId: queueEntry.patientId,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber
      } : null,
      status: updatedEntry.status,
      previousStatus: currentStatus,
      updatedAt: now,
      consultationStartTime: updatedEntry.consultationStartTime,
      consultationEndTime: updatedEntry.consultationEndTime,
      actualDuration: updatedEntry.actualDuration,
      waitTime,
      consultationTime,
      consultationSummary: updatedEntry.consultationSummary,
      notes: updatedEntry.notes
    }

    // Add status-specific response data
    if (status === 'completed') {
      responseData.duration = updatedEntry.actualDuration
      responseData.completedAt = updatedEntry.consultationEndTime
    }

    return NextResponse.json({
      success: true,
      message: `Patient status updated to '${status}' successfully`,
      data: responseData
    })

  } catch (error) {
    console.error('Error updating patient status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update patient status",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { queueId: string } }
) {
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

    const { queueId } = params

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

    const doctorId = user.userId || user.id

    // Verify doctor owns this patient
    if (queueEntry.doctorId !== doctorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. You can only view your own patients.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      )
    }

    // Get patient info
    const patient = mockPatients.get(queueEntry.patientId)

    // Calculate metrics
    const waitTime = queueEntry.queuedAt ?
      Math.floor((Date.now() - new Date(queueEntry.queuedAt).getTime()) / (1000 * 60)) : 0

    const consultationTime = queueEntry.consultationStartTime ?
      Math.floor((Date.now() - new Date(queueEntry.consultationStartTime).getTime()) / (1000 * 60)) : 0

    const responseData = {
      queueId,
      patientId: queueEntry.patientId,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber
      } : null,
      status: queueEntry.status,
      priority: queueEntry.priority,
      reason: queueEntry.reason,
      symptoms: queueEntry.symptoms || [],
      type: queueEntry.type,
      position: queueEntry.position,
      queuedAt: queueEntry.queuedAt,
      assignedAt: queueEntry.assignedAt,
      consultationStartTime: queueEntry.consultationStartTime,
      consultationEndTime: queueEntry.consultationEndTime,
      estimatedDuration: queueEntry.estimatedDuration,
      actualDuration: queueEntry.actualDuration,
      waitTime,
      consultationTime,
      notes: queueEntry.notes,
      consultationSummary: queueEntry.consultationSummary,
      statusHistory: queueEntry.statusHistory,
      availableTransitions: getAvailableTransitions(queueEntry.status)
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error getting patient status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get patient status",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

function getAvailableTransitions(currentStatus: string): string[] {
  const transitions: { [key: string]: string[] } = {
    'assigned': ['in-consultation', 'cancelled', 'no-show'],
    'in-consultation': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
    'no-show': []
  }

  return transitions[currentStatus] || []
}
