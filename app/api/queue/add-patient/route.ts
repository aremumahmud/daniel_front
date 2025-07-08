import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockPatients = new Map()
const mockQueue = new Map()

// Initialize some mock patients
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1985-03-15",
  gender: "male",
  phone: "+1234567890",
  email: "john.doe@email.com"
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

    // Check if user has appropriate role (Admin, Doctor, or Patient)
    if (!['admin', 'doctor', 'patient'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      patientId,
      priority,
      reason,
      symptoms,
      type,
      appointmentId,
      notes
    } = body

    // Validate required fields
    if (!patientId || !priority || !reason || !type) {
      return NextResponse.json(
        { success: false, message: 'Patient ID, priority, reason, and type are required' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ["emergency", "high", "medium", "low"]
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, message: 'Invalid priority level. Must be: emergency, high, medium, or low' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ["walk-in", "appointment", "emergency"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid type. Must be: walk-in, appointment, or emergency' },
        { status: 400 }
      )
    }

    // Check if patient exists
    const patient = mockPatients.get(patientId)
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      )
    }

    // Check if patient is already in queue
    const existingQueueEntry = Array.from(mockQueue.values()).find(
      (entry: any) => entry.patientId === patientId && entry.status === 'waiting'
    )

    if (existingQueueEntry) {
      return NextResponse.json(
        { success: false, message: 'Patient is already in the queue' },
        { status: 409 }
      )
    }

    // Calculate queue position and estimated wait time
    const currentQueueSize = Array.from(mockQueue.values()).filter(
      (entry: any) => entry.status === 'waiting'
    ).length

    const position = currentQueueSize + 1
    const estimatedWaitTime = position * 15 // 15 minutes per position

    // Create queue entry
    const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const queueEntry = {
      _id: queueId,
      patientId: patientId,
      priority: priority,
      reason: reason,
      symptoms: symptoms || null,
      type: type,
      appointmentId: appointmentId || null,
      status: "waiting",
      position: position,
      estimatedWaitTime: estimatedWaitTime,
      queuedAt: new Date().toISOString(),
      notes: notes || null,
      addedBy: decoded.userId
    }

    // Store queue entry
    mockQueue.set(queueId, queueEntry)

    // In a real implementation, emit WebSocket events
    // io.emit('queue_updated', { action: 'patient_added', queueEntry })

    return NextResponse.json({
      success: true,
      message: "Patient added to queue successfully",
      data: queueEntry
    })

  } catch (error) {
    console.error('Error adding patient to queue:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add patient to queue. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
