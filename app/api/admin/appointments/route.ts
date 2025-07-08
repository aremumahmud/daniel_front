import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock appointments data for demonstration
const mockAppointments = new Map()

// Initialize mock appointments
mockAppointments.set("appointment-001", {
  id: "appointment-001",
  patientId: "patient-001",
  doctorId: "doctor-001",
  patientName: "John Doe",
  doctorName: "Dr. Jane Smith",
  specialization: "Cardiology",
  date: "2024-01-16",
  time: "10:00",
  duration: 30,
  status: "scheduled",
  type: "consultation",
  reason: "Regular checkup",
  notes: "",
  createdAt: "2024-01-10T08:00:00.000Z",
  updatedAt: "2024-01-10T08:00:00.000Z"
})

mockAppointments.set("appointment-002", {
  id: "appointment-002",
  patientId: "patient-002",
  doctorId: "doctor-002",
  patientName: "Alice Johnson",
  doctorName: "Dr. Michael Johnson",
  specialization: "Neurology",
  date: "2024-01-16",
  time: "14:00",
  duration: 45,
  status: "completed",
  type: "follow-up",
  reason: "Diabetes management",
  notes: "Patient doing well, continue current medication",
  createdAt: "2024-01-08T09:15:00.000Z",
  updatedAt: "2024-01-15T14:45:00.000Z"
})

mockAppointments.set("appointment-003", {
  id: "appointment-003",
  patientId: "patient-003",
  doctorId: "doctor-003",
  patientName: "Robert Brown",
  doctorName: "Dr. Sarah Wilson",
  specialization: "Pediatrics",
  date: "2024-01-17",
  time: "11:30",
  duration: 30,
  status: "scheduled",
  type: "consultation",
  reason: "Annual physical",
  notes: "",
  createdAt: "2024-01-12T11:00:00.000Z",
  updatedAt: "2024-01-12T11:00:00.000Z"
})

mockAppointments.set("appointment-004", {
  id: "appointment-004",
  patientId: "patient-001",
  doctorId: "doctor-001",
  patientName: "John Doe",
  doctorName: "Dr. Jane Smith",
  specialization: "Cardiology",
  date: "2024-01-15",
  time: "15:00",
  duration: 30,
  status: "cancelled",
  type: "consultation",
  reason: "Blood pressure check",
  notes: "Patient cancelled due to emergency",
  createdAt: "2024-01-10T08:30:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
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

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Filter appointments based on query parameters
    let filteredAppointments = Array.from(mockAppointments.values())

    // Filter by status
    if (status) {
      filteredAppointments = filteredAppointments.filter(appointment => appointment.status === status)
    }

    // Filter by doctor
    if (doctorId) {
      filteredAppointments = filteredAppointments.filter(appointment => appointment.doctorId === doctorId)
    }

    // Filter by patient
    if (patientId) {
      filteredAppointments = filteredAppointments.filter(appointment => appointment.patientId === patientId)
    }

    // Filter by specific date
    if (date) {
      filteredAppointments = filteredAppointments.filter(appointment => appointment.date === date)
    }

    // Filter by date range
    if (startDate && endDate) {
      filteredAppointments = filteredAppointments.filter(appointment => 
        appointment.date >= startDate && appointment.date <= endDate
      )
    }

    // Sort by date and time (most recent first)
    filteredAppointments.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`)
      const dateTimeB = new Date(`${b.date}T${b.time}`)
      return dateTimeB.getTime() - dateTimeA.getTime()
    })

    // Calculate pagination
    const total = filteredAppointments.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedAppointments = filteredAppointments.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        appointments: paginatedAppointments,
        pagination: {
          total,
          page,
          totalPages,
          totalAppointments: total
        }
      }
    })

  } catch (error) {
    console.error('Error getting appointments:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get appointments. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
