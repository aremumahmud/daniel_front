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

mockDoctors.set("550e8400-e29b-41d4-a716-446655440003", {
  id: "550e8400-e29b-41d4-a716-446655440003",
  name: "Dr. Jane Smith",
  specialization: "General Medicine",
  currentPatients: 2,
  maxPatients: 8,
  isOnline: true,
  isAvailable: true,
  averageConsultationTime: 25
})

// Initialize a waiting queue entry
mockQueue.set("550e8400-e29b-41d4-a716-446655440002", {
  _id: "550e8400-e29b-41d4-a716-446655440002",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  priority: "medium",
  reason: "Regular checkup",
  status: "waiting",
  queuedAt: new Date(Date.now() - 20 * 60000).toISOString(), // 20 minutes ago
  type: "walk-in"
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

    // Check if user has appropriate role (Admin or Doctor)
    if (!['admin', 'doctor'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or Doctor role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { queueId, doctorId, notes } = body

    // Validate required fields
    if (!queueId || !doctorId) {
      return NextResponse.json(
        { success: false, message: 'Queue ID and Doctor ID are required' },
        { status: 400 }
      )
    }

    // Check if queue entry exists
    const queueEntry = mockQueue.get(queueId)
    if (!queueEntry) {
      return NextResponse.json(
        { success: false, message: 'Queue entry not found' },
        { status: 404 }
      )
    }

    // Check if queue entry is in waiting status
    if (queueEntry.status !== 'waiting') {
      return NextResponse.json(
        { success: false, message: 'Queue entry is not in waiting status' },
        { status: 400 }
      )
    }

    // Check if doctor exists and is available
    const doctor = mockDoctors.get(doctorId)
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      )
    }

    if (!doctor.isOnline) {
      return NextResponse.json(
        { success: false, message: 'Doctor is currently offline' },
        { status: 400 }
      )
    }

    if (!doctor.isAvailable) {
      return NextResponse.json(
        { success: false, message: 'Doctor is currently unavailable' },
        { status: 400 }
      )
    }

    if (doctor.currentPatients >= doctor.maxPatients) {
      return NextResponse.json(
        { success: false, message: 'Doctor is at maximum capacity' },
        { status: 400 }
      )
    }

    // Perform assignment
    const assignedAt = new Date().toISOString()
    const estimatedStartTime = new Date(Date.now() + 5 * 60000).toISOString() // 5 minutes from now

    // Update queue entry
    queueEntry.status = 'in_progress'
    queueEntry.doctorId = doctorId
    queueEntry.assignedAt = assignedAt
    queueEntry.estimatedStartTime = estimatedStartTime
    queueEntry.assignmentNotes = notes || null
    queueEntry.assignedBy = decoded.userId

    // Update doctor's current load
    doctor.currentPatients += 1
    if (doctor.currentPatients >= doctor.maxPatients) {
      doctor.isAvailable = false
    }

    // Get patient information for response
    const patient = mockPatients.get(queueEntry.patientId)

    // In a real implementation, emit WebSocket events
    // io.emit('patient_assigned', {
    //   queueId: queueEntry._id,
    //   patientId: queueEntry.patientId,
    //   doctorId: doctorId,
    //   assignedAt: assignedAt
    // })
    // io.to(`doctor-${doctorId}`).emit('new_patient_assigned', queueEntry)

    return NextResponse.json({
      success: true,
      message: "Patient assigned successfully",
      data: {
        _id: queueEntry._id,
        patientId: queueEntry.patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
        doctorId: doctorId,
        doctorName: doctor.name,
        status: queueEntry.status,
        assignedAt: assignedAt,
        estimatedStartTime: estimatedStartTime,
        notes: notes || null
      }
    })

  } catch (error) {
    console.error('Error assigning patient:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign patient. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
