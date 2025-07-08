import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'

// Mock data for demonstration - should match the data structure from assign-patient route
const mockQueue = new Map()
const mockPatients = new Map()

// Initialize mock data to match the assign-patient route
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith"
})

mockPatients.set("771h1733-h8fh-97j0-g37c-00cc11006666", {
  id: "771h1733-h8fh-97j0-g37c-00cc11006666",
  firstName: "Michael",
  lastName: "Johnson"
})

// Initialize some queue entries assigned to doctors
mockQueue.set("550e8400-e29b-41d4-a716-446655440002", {
  _id: "550e8400-e29b-41d4-a716-446655440002",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  priority: "medium",
  reason: "Regular checkup",
  symptoms: "Mild headache and fatigue",
  status: "in_progress",
  position: 1,
  doctorId: "770g0622-g4bd-63f6-c938-668877662222", // Dr. John Doe
  queuedAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
  assignedAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
  estimatedStartTime: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
  type: "walk-in"
})

mockQueue.set("660f9511-f3ac-52e5-b827-557766551112", {
  _id: "660f9511-f3ac-52e5-b827-557766551112",
  patientId: "660f9511-f3ac-52e5-b827-557766551111",
  priority: "high",
  reason: "Follow-up consultation",
  symptoms: "Chest pain",
  status: "assigned",
  position: 2,
  doctorId: "770g0622-g4bd-63f6-c938-668877662222", // Dr. John Doe
  queuedAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
  assignedAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
  estimatedStartTime: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes from now
  type: "appointment"
})

mockQueue.set("771h1733-h8fh-97j0-g37c-00cc11006667", {
  _id: "771h1733-h8fh-97j0-g37c-00cc11006667",
  patientId: "771h1733-h8fh-97j0-g37c-00cc11006666",
  priority: "medium",
  reason: "Routine examination",
  symptoms: "General wellness check",
  status: "waiting",
  position: 3,
  doctorId: "770g0622-g4bd-63f6-c938-668877662222", // Dr. John Doe
  queuedAt: new Date(Date.now() - 20 * 60000).toISOString(), // 20 minutes ago
  assignedAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
  estimatedStartTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
  type: "appointment"
})

// Helper function to extract JWT token and user info
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
    const headersList = headers()
    const authorization = headersList.get('authorization')

    // Authenticate user
    const user = extractUserFromToken(authorization)
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

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Filter queue entries for this specific doctor
    const doctorQueueEntries = Array.from(mockQueue.values()).filter(entry =>
      entry.doctorId === doctorId
    )

    // Separate current patient (in_progress) from waiting patients
    const currentPatient = doctorQueueEntries.find(entry => entry.status === 'in_progress')
    const nextPatients = doctorQueueEntries.filter(entry => entry.status === 'waiting' || entry.status === 'assigned')

    // Format the data for the frontend
    const formatPatientData = (entry: any) => {
      const patient = mockPatients.get(entry.patientId)
      return {
        id: entry._id,
        name: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
        queueNumber: `Q${entry.position.toString().padStart(3, '0')}`,
        priority: entry.priority,
        status: entry.status,
        reason: entry.reason,
        symptoms: entry.symptoms,
        estimatedTime: entry.estimatedStartTime ? new Date(entry.estimatedStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
        waitingTime: entry.queuedAt ? Math.floor((Date.now() - new Date(entry.queuedAt).getTime()) / (1000 * 60)) : 0,
        assignedAt: entry.assignedAt,
        startTime: entry.estimatedStartTime
      }
    }

    const queueData = {
      currentPatient: currentPatient ? formatPatientData(currentPatient) : null,
      queueLength: nextPatients.length,
      nextPatients: nextPatients.map(formatPatientData),
      hasWaitingPatients: nextPatients.length > 0
    }

    return NextResponse.json({
      success: true,
      data: queueData
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
