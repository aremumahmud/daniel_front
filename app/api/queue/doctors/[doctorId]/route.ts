import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue data - should match the assign-patient route data structure
const mockQueue = new Map()
const mockPatients = new Map()

// Initialize mock patients
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  email: "jane.smith@example.com",
  phone: "+1234567891"
})

mockPatients.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Michael",
  lastName: "Johnson",
  email: "michael.johnson@example.com",
  phone: "+1234567892"
})

// Initialize mock queue entries
mockQueue.set("queue-001", {
  _id: "queue-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222", // Dr. John Smith from login route
  position: 1,
  priority: "high",
  status: "assigned",
  reason: "Regular checkup",
  symptoms: "Mild headache and fatigue",
  queuedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  assignedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  estimatedStartTime: new Date(Date.now() + 5 * 60000).toISOString(),
  type: "consultation"
})

mockQueue.set("queue-002", {
  _id: "queue-002",
  patientId: "660f9511-f3ac-52e5-b827-557766551111",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  position: 2,
  priority: "medium",
  status: "waiting",
  reason: "Follow-up consultation",
  symptoms: "Back pain",
  queuedAt: new Date(Date.now() - 20 * 60000).toISOString(),
  assignedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  estimatedStartTime: new Date(Date.now() + 25 * 60000).toISOString(),
  type: "follow-up"
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

export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
    if (!user || !['doctor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    const { doctorId } = params

    // For doctors, ensure they can only access their own queue
    if (user.role === 'doctor' && (user.userId || user.id) !== doctorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. You can only view your own queue.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      )
    }

    // Filter queue entries for this specific doctor
    const doctorQueueEntries = Array.from(mockQueue.values()).filter(entry =>
      entry.doctorId === doctorId
    )

    // Sort by position
    doctorQueueEntries.sort((a, b) => a.position - b.position)

    // Find current patient (in consultation) and next patients (waiting)
    const currentPatient = doctorQueueEntries.find(entry => entry.status === 'in-consultation')
    const nextPatients = doctorQueueEntries.filter(entry => 
      entry.status === 'assigned' || entry.status === 'waiting'
    )

    // Format the data for the frontend
    const formatPatientData = (entry: any) => {
      const patient = mockPatients.get(entry.patientId)
      return {
        id: entry._id,
        patientId: entry.patientId,
        name: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
        queueNumber: `Q${entry.position.toString().padStart(3, '0')}`,
        priority: entry.priority,
        status: entry.status,
        reason: entry.reason,
        symptoms: entry.symptoms,
        type: entry.type,
        estimatedTime: entry.estimatedStartTime ? new Date(entry.estimatedStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
        waitingTime: entry.queuedAt ? Math.floor((Date.now() - new Date(entry.queuedAt).getTime()) / (1000 * 60)) : 0,
        assignedAt: entry.assignedAt,
        startTime: entry.estimatedStartTime,
        patient: patient ? {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone
        } : null
      }
    }

    const queueData = {
      doctorId: doctorId,
      currentPatient: currentPatient ? formatPatientData(currentPatient) : null,
      queueLength: nextPatients.length,
      nextPatients: nextPatients.map(formatPatientData),
      hasWaitingPatients: nextPatients.length > 0,
      totalAssigned: doctorQueueEntries.length,
      stats: {
        totalWaiting: nextPatients.length,
        averageWaitTime: nextPatients.length > 0 ? 
          nextPatients.reduce((acc, p) => acc + (p.queuedAt ? Math.floor((Date.now() - new Date(p.queuedAt).getTime()) / (1000 * 60)) : 0), 0) / nextPatients.length : 0
      }
    }

    return NextResponse.json({
      success: true,
      data: queueData
    })

  } catch (error) {
    console.error('Error getting doctor queue:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get doctor queue",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
