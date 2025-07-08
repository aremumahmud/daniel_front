import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockConsultations = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()

// Initialize some mock data
mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith"
})

mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  userId: {
    firstName: "John",
    lastName: "Doe"
  },
  specialization: "General Medicine",
  currentLoad: 1,
  maxCapacity: 5,
  status: "busy"
})

// Initialize a mock consultation
mockConsultations.set("550e8400-e29b-41d4-a716-446655440000", {
  _id: "550e8400-e29b-41d4-a716-446655440000",
  status: "scheduled",
  scheduledTime: "2024-01-10T15:00:00Z",
  patient: mockPatients.get("660f9511-f3ac-52e5-b827-557766551111"),
  doctor: mockDoctors.get("770g0622-g4bd-63f6-c938-668877662222"),
  queue: {
    _id: "880h1733-h5ce-74g7-d049-779988773333",
    queueNumber: "Q001",
    priority: "normal"
  }
})

export async function POST(
  request: NextRequest,
  { params }: { params: { consultationId: string } }
) {
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

    // Check if user is a doctor
    if (decoded.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    const { consultationId } = params
    const body = await request.json()
    const { reason } = body

    // Validate required fields
    if (!reason) {
      return NextResponse.json(
        { success: false, message: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    // Get consultation
    const consultation = mockConsultations.get(consultationId)

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: 'Consultation not found' },
        { status: 404 }
      )
    }

    // Check if consultation can be cancelled
    if (consultation.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel a completed consultation' },
        { status: 400 }
      )
    }

    if (consultation.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Consultation is already cancelled' },
        { status: 400 }
      )
    }

    // Cancel the consultation
    const cancelledConsultation = {
      ...consultation,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
      cancelledBy: decoded.userId
    }

    // Update consultation in storage
    mockConsultations.set(consultationId, cancelledConsultation)

    // Update doctor availability
    const doctorId = decoded.doctorId || "770g0622-g4bd-63f6-c938-668877662222"
    const doctor = mockDoctors.get(doctorId)
    
    if (doctor && consultation.status === 'in_progress') {
      // If consultation was in progress, reduce doctor's current load
      doctor.currentLoad = Math.max(0, doctor.currentLoad - 1)
      doctor.status = doctor.currentLoad >= doctor.maxCapacity ? "busy" : "available"
    }

    // In a real implementation, emit WebSocket events and handle queue reassignment
    // io.emit('consultation-cancelled', { consultationId, doctorId, reason })
    // Trigger automatic reassignment of next patient if doctor becomes available

    return NextResponse.json({
      success: true,
      message: "Consultation cancelled successfully",
      data: {
        consultationId: consultationId,
        status: "cancelled",
        cancelledAt: cancelledConsultation.cancelledAt,
        reason: reason
      }
    })

  } catch (error) {
    console.error('Error cancelling consultation:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel consultation. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
