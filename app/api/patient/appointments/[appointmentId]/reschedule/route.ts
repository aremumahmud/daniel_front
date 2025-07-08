import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock appointments data for demonstration (shared with other appointment routes)
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

mockAppointments.set("appt-reschedule-001", {
  _id: "appt-reschedule-001",
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

// Mock doctor availability for validation
const mockDoctorAvailability = new Map()
mockDoctorAvailability.set("550e8400-e29b-41d4-a716-446655440003", {
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  availableSlots: [
    { date: "2024-01-20", slots: ["09:00", "10:00", "14:00", "15:00"] },
    { date: "2024-01-21", slots: ["09:00", "11:00", "16:00"] },
    { date: "2024-01-22", slots: ["09:00", "11:00", "15:00", "16:00"] },
    { date: "2024-01-23", slots: ["10:00", "14:00", "15:00"] },
    { date: "2024-01-24", slots: ["09:00", "10:00", "11:00", "14:00"] }
  ]
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
    const { appointmentDate, appointmentTime, reason, notifyDoctor } = body

    // Validate required fields
    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { success: false, message: 'New appointment date and time are required' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(appointmentDate)) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(appointmentTime)) {
      return NextResponse.json(
        { success: false, message: 'Invalid time format. Use HH:MM' },
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

    // Check if user has permission to reschedule this appointment
    const userPatientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'patient' && existingAppointment.patientId !== userPatientId) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only reschedule your own appointments.' },
        { status: 403 }
      )
    }

    // Check if appointment can be rescheduled
    if (existingAppointment.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Cannot reschedule a cancelled appointment' },
        { status: 400 }
      )
    }

    if (existingAppointment.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'Cannot reschedule a completed appointment' },
        { status: 400 }
      )
    }

    // Check if new appointment date/time is in the future
    const newAppointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)
    const now = new Date()
    if (newAppointmentDateTime <= now) {
      return NextResponse.json(
        { success: false, message: 'New appointment date and time must be in the future' },
        { status: 400 }
      )
    }

    // Check if the new date/time is the same as current
    if (appointmentDate === existingAppointment.appointmentDate && 
        appointmentTime === existingAppointment.appointmentTime) {
      return NextResponse.json(
        { success: false, message: 'New appointment date and time must be different from current appointment' },
        { status: 400 }
      )
    }

    // Check doctor availability for the new slot
    const doctorAvailability = mockDoctorAvailability.get(existingAppointment.doctorId)
    if (doctorAvailability) {
      const dayAvailability = doctorAvailability.availableSlots.find((slot: any) => slot.date === appointmentDate)
      if (!dayAvailability || !dayAvailability.slots.includes(appointmentTime)) {
        return NextResponse.json(
          { success: false, message: 'Doctor is not available at the requested time' },
          { status: 400 }
        )
      }
    }

    // Store previous appointment details
    const previousDate = existingAppointment.appointmentDate
    const previousTime = existingAppointment.appointmentTime

    // Update appointment
    const updatedAppointment = {
      ...existingAppointment,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      status: "scheduled",
      rescheduledAt: new Date().toISOString(),
      rescheduledBy: decoded.role,
      rescheduleReason: reason || "Patient requested reschedule",
      previousDate: previousDate,
      previousTime: previousTime,
      notifyDoctor: notifyDoctor || false,
      updatedAt: new Date().toISOString(),
      rescheduleHistory: [
        ...(existingAppointment.rescheduleHistory || []),
        {
          fromDate: previousDate,
          fromTime: previousTime,
          toDate: appointmentDate,
          toTime: appointmentTime,
          rescheduledAt: new Date().toISOString(),
          rescheduledBy: decoded.role,
          reason: reason || "Patient requested reschedule"
        }
      ]
    }

    // Store updated appointment
    mockAppointments.set(appointmentId, updatedAppointment)

    // In a real system, you would:
    // 1. Update doctor's schedule (free old slot, book new slot)
    // 2. Send notification to doctor if notifyDoctor is true
    // 3. Send confirmation email to patient
    // 4. Update any related calendar entries

    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: {
        _id: appointmentId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        status: "scheduled",
        rescheduledAt: updatedAppointment.rescheduledAt,
        rescheduledBy: decoded.role,
        rescheduleReason: reason || "Patient requested reschedule",
        previousDate: previousDate,
        previousTime: previousTime
      }
    })

  } catch (error) {
    console.error('Error rescheduling appointment:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reschedule appointment. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
