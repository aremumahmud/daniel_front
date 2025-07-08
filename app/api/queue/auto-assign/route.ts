import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockQueue = new Map()
const mockDoctors = new Map()
const mockPatients = new Map()

// Initialize mock data
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

mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  name: "Dr. John Wilson",
  specialization: "General Medicine",
  currentPatients: 1,
  maxPatients: 5,
  isOnline: true,
  isAvailable: true,
  averageConsultationTime: 30
})

mockDoctors.set("881i2844-i6df-85h8-e15a-88aa99884444", {
  id: "881i2844-i6df-85h8-e15a-88aa99884444",
  name: "Dr. Sarah Wilson",
  specialization: "Cardiology",
  currentPatients: 0,
  maxPatients: 3,
  isOnline: true,
  isAvailable: true,
  averageConsultationTime: 45
})

// Initialize some waiting queue entries
mockQueue.set("queue-001", {
  _id: "queue-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  priority: "high",
  status: "waiting",
  queuedAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
  type: "walk-in"
})

mockQueue.set("queue-002", {
  _id: "queue-002",
  patientId: "660f9511-f3ac-52e5-b827-557766551111",
  priority: "medium",
  status: "waiting",
  queuedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
  type: "appointment"
})

export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      maxAssignments,
      priorityOnly = false,
      specialization
    } = body

    // Get waiting patients sorted by priority and queue time
    const priorityWeights = { emergency: 1000, high: 100, medium: 10, low: 1 }
    const waitingPatients = Array.from(mockQueue.values())
      .filter((entry: any) => entry.status === 'waiting')
      .filter((entry: any) => {
        if (priorityOnly) {
          return ['emergency', 'high'].includes(entry.priority)
        }
        return true
      })
      .sort((a: any, b: any) => {
        // Sort by priority weight first, then by queue time
        const priorityDiff = priorityWeights[b.priority as keyof typeof priorityWeights] - 
                           priorityWeights[a.priority as keyof typeof priorityWeights]
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
      })

    // Get available doctors
    const availableDoctors = Array.from(mockDoctors.values())
      .filter((doctor: any) => 
        doctor.isOnline && 
        doctor.isAvailable && 
        doctor.currentPatients < doctor.maxPatients
      )
      .filter((doctor: any) => {
        if (specialization) {
          return doctor.specialization === specialization
        }
        return true
      })
      .sort((a: any, b: any) => a.currentPatients - b.currentPatients) // Prefer doctors with fewer patients

    if (availableDoctors.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No available doctors for assignment",
        data: {
          assignedPatients: 0,
          totalWaiting: waitingPatients.length,
          availableDoctors: 0,
          assignments: []
        }
      })
    }

    // Perform assignments
    const assignments = []
    const assignmentLimit = maxAssignments || waitingPatients.length
    let assignmentCount = 0

    for (const queueEntry of waitingPatients) {
      if (assignmentCount >= assignmentLimit) break

      // Find best available doctor
      const availableDoctor = availableDoctors.find((doctor: any) => 
        doctor.currentPatients < doctor.maxPatients
      )

      if (!availableDoctor) break

      // Create assignment
      const patient = mockPatients.get(queueEntry.patientId)
      const assignment = {
        queueId: queueEntry._id,
        patientId: queueEntry.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
        doctorId: availableDoctor.id,
        doctorName: availableDoctor.name,
        assignedAt: new Date().toISOString(),
        estimatedStartTime: new Date(Date.now() + 5 * 60000).toISOString() // 5 minutes from now
      }

      assignments.push(assignment)

      // Update queue entry status
      queueEntry.status = 'in_progress'
      queueEntry.assignedDoctorId = availableDoctor.id
      queueEntry.assignedAt = assignment.assignedAt

      // Update doctor's current load
      availableDoctor.currentPatients += 1

      assignmentCount++
    }

    // In a real implementation, emit WebSocket events
    // assignments.forEach(assignment => {
    //   io.emit('patient_assigned', assignment)
    //   io.to(`doctor-${assignment.doctorId}`).emit('new_patient_assigned', assignment)
    // })

    return NextResponse.json({
      success: true,
      message: "Auto-assignment completed",
      data: {
        assignedPatients: assignments.length,
        totalWaiting: waitingPatients.length - assignments.length,
        availableDoctors: availableDoctors.filter((doctor: any) => 
          doctor.currentPatients < doctor.maxPatients
        ).length,
        assignments: assignments
      }
    })

  } catch (error) {
    console.error('Error in auto-assignment:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform auto-assignment. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
