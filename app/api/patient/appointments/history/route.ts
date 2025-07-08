import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock appointments data for demonstration
const mockAppointments = new Map()

// Initialize some mock appointments
mockAppointments.set("550e8400-e29b-41d4-a716-446655440004", {
  _id: "550e8400-e29b-41d4-a716-446655440004",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  appointmentDate: "2024-01-15",
  appointmentTime: "10:00",
  type: "consultation",
  reason: "Regular checkup",
  status: "completed",
  duration: 30,
  notes: "Routine examination completed",
  createdAt: "2024-01-10T09:00:00.000Z",
  completedAt: "2024-01-15T10:30:00.000Z"
})

mockAppointments.set("appt-002", {
  _id: "appt-002",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  appointmentDate: "2024-01-08",
  appointmentTime: "14:00",
  type: "follow-up",
  reason: "Blood pressure monitoring",
  status: "completed",
  duration: 20,
  notes: "Blood pressure stable, continue medication",
  createdAt: "2024-01-05T11:00:00.000Z",
  completedAt: "2024-01-08T14:20:00.000Z"
})

mockAppointments.set("appt-003", {
  _id: "appt-003",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  doctorId: "550e8400-e29b-41d4-a716-446655440005",
  doctorName: "Dr. Michael Johnson",
  appointmentDate: "2024-01-03",
  appointmentTime: "09:00",
  type: "consultation",
  reason: "Joint pain evaluation",
  status: "completed",
  duration: 45,
  notes: "Prescribed anti-inflammatory medication",
  createdAt: "2023-12-28T10:00:00.000Z",
  completedAt: "2024-01-03T09:45:00.000Z"
})

mockAppointments.set("appt-004", {
  _id: "appt-004",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  appointmentDate: "2023-12-20",
  appointmentTime: "11:00",
  type: "consultation",
  reason: "Annual physical exam",
  status: "completed",
  duration: 60,
  notes: "Complete physical examination, all normal",
  createdAt: "2023-12-15T14:00:00.000Z",
  completedAt: "2023-12-20T12:00:00.000Z"
})

mockAppointments.set("appt-005", {
  _id: "appt-005",
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

mockAppointments.set("appt-006", {
  _id: "appt-006",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  doctorId: "550e8400-e29b-41d4-a716-446655440005",
  doctorName: "Dr. Michael Johnson",
  appointmentDate: "2023-12-15",
  appointmentTime: "15:00",
  type: "consultation",
  reason: "Flu symptoms",
  status: "cancelled",
  duration: 30,
  notes: "Patient cancelled due to recovery",
  createdAt: "2023-12-12T10:00:00.000Z",
  cancelledAt: "2023-12-14T16:00:00.000Z",
  cancellationReason: "Patient recovered"
})

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const doctorId = searchParams.get('doctorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      patientId = searchParams.get('patientId') || patientId
    }

    // Filter appointments by patient
    let filteredAppointments = Array.from(mockAppointments.values())
      .filter((appointment: any) => appointment.patientId === patientId)

    // Apply filters
    if (status) {
      filteredAppointments = filteredAppointments.filter((appointment: any) => appointment.status === status)
    }

    if (doctorId) {
      filteredAppointments = filteredAppointments.filter((appointment: any) => appointment.doctorId === doctorId)
    }

    if (startDate) {
      filteredAppointments = filteredAppointments.filter((appointment: any) => 
        appointment.appointmentDate >= startDate
      )
    }

    if (endDate) {
      filteredAppointments = filteredAppointments.filter((appointment: any) => 
        appointment.appointmentDate <= endDate
      )
    }

    // Sort appointments by date (most recent first)
    filteredAppointments.sort((a: any, b: any) => {
      const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`)
      const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`)
      return dateB.getTime() - dateA.getTime()
    })

    // Calculate pagination
    const totalRecords = filteredAppointments.length
    const totalPages = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

    // Calculate summary statistics
    const totalAppointments = filteredAppointments.length
    const completedAppointments = filteredAppointments.filter((appt: any) => appt.status === 'completed').length
    const cancelledAppointments = filteredAppointments.filter((appt: any) => appt.status === 'cancelled').length
    const upcomingAppointments = filteredAppointments.filter((appt: any) => {
      const appointmentDateTime = new Date(`${appt.appointmentDate}T${appt.appointmentTime}`)
      return appt.status === 'scheduled' && appointmentDateTime > new Date()
    }).length

    return NextResponse.json({
      success: true,
      data: {
        appointments: paginatedAppointments,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalRecords: totalRecords
        },
        summary: {
          totalAppointments: totalAppointments,
          completedAppointments: completedAppointments,
          cancelledAppointments: cancelledAppointments,
          upcomingAppointments: upcomingAppointments
        }
      }
    })

  } catch (error) {
    console.error('Error getting appointment history:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get appointment history. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
