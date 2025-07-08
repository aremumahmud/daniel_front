import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock appointments data for demonstration (shared with history route)
const mockAppointments = new Map()

// Initialize some mock appointments
mockAppointments.set("550e8400-e29b-41d4-a716-446655440004", {
  _id: "550e8400-e29b-41d4-a716-446655440004",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  appointmentDate: "2024-01-22",
  appointmentTime: "10:00",
  type: "follow-up",
  reason: "Medication review",
  status: "scheduled",
  duration: 30,
  notes: "",
  createdAt: "2024-01-16T09:00:00.000Z"
})

mockAppointments.set("appt-future-001", {
  _id: "appt-future-001",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  appointmentDate: "2024-01-25",
  appointmentTime: "14:00",
  type: "consultation",
  reason: "Follow-up examination",
  status: "scheduled",
  duration: 30,
  notes: "",
  createdAt: "2024-01-17T10:00:00.000Z"
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
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

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    const { appointmentId } = params
    const body = await request.json()
    const { reason, notifyDoctor, requestReschedule } = body

    // Validate required fields
    if (!reason) {
      return NextResponse.json(
        { success: false, message: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    // Find the appointment
    const existingAppointment = mockAppointments.get(appointmentId)
    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to cancel this appointment
    const userPatientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'patient' && existingAppointment.patientId !== userPatientId) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only cancel your own appointments.' },
        { status: 403 }
      )
    }

    // Check if appointment can be cancelled
    if (existingAppointment.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Appointment is already cancelled' },
        { status: 400 }
      )
    }

    if (existingAppointment.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel a completed appointment' },
        { status: 400 }
      )
    }

    // Check if appointment is in the past
    const appointmentDateTime = new Date(`${existingAppointment.appointmentDate}T${existingAppointment.appointmentTime}`)
    const now = new Date()
    if (appointmentDateTime < now) {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel past appointments' },
        { status: 400 }
      )
    }

    // Calculate if refund is eligible (e.g., cancelled more than 24 hours in advance)
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const refundEligible = hoursUntilAppointment > 24

    // Generate reschedule options (next available slots)
    const rescheduleOptions = requestReschedule ? [
      {
        date: "2024-01-18",
        time: "10:00"
      },
      {
        date: "2024-01-19",
        time: "14:00"
      },
      {
        date: "2024-01-22",
        time: "09:00"
      }
    ] : []

    // Update appointment
    const updatedAppointment = {
      ...existingAppointment,
      status: "cancelled",
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      cancelledBy: decoded.role,
      notifyDoctor: notifyDoctor || false,
      requestReschedule: requestReschedule || false,
      refundEligible: refundEligible,
      updatedAt: new Date().toISOString()
    }

    // Store updated appointment
    mockAppointments.set(appointmentId, updatedAppointment)

    // In a real system, you would:
    // 1. Send notification to doctor if notifyDoctor is true
    // 2. Update doctor's schedule to free up the slot
    // 3. Process refund if eligible
    // 4. Send confirmation email to patient

    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully",
      data: {
        _id: appointmentId,
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: updatedAppointment.cancelledAt,
        cancelledBy: decoded.role,
        refundEligible: refundEligible,
        rescheduleOptions: rescheduleOptions
      }
    })

  } catch (error) {
    console.error('Error cancelling appointment:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to cancel appointment. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
