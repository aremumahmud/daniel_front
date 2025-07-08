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
  lastName: "Smith",
  dateOfBirth: "1985-03-15",
  gender: "female",
  phone: "+1234567890",
  email: "jane.smith@email.com"
})

mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  userId: {
    firstName: "John",
    lastName: "Doe"
  },
  specialization: "General Medicine",
  currentLoad: 0,
  maxCapacity: 5,
  status: "available"
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
    const doctorId = decoded.doctorId || "770g0622-g4bd-63f6-c938-668877662222"

    // Check if consultation exists and is scheduled
    const scheduledConsultation = {
      _id: consultationId,
      status: "scheduled",
      scheduledTime: new Date().toISOString(),
      estimatedDuration: 30,
      patient: mockPatients.get("660f9511-f3ac-52e5-b827-557766551111"),
      doctor: mockDoctors.get(doctorId),
      queue: {
        _id: "880h1733-h5ce-74g7-d049-779988773333",
        queueNumber: "Q001",
        priority: "normal"
      }
    }

    if (!scheduledConsultation) {
      return NextResponse.json(
        { success: false, message: 'Consultation not found or not scheduled' },
        { status: 404 }
      )
    }

    // Start the consultation
    const startedConsultation = {
      ...scheduledConsultation,
      status: "in_progress",
      startTime: new Date().toISOString()
    }

    // Store the started consultation
    mockConsultations.set(consultationId, startedConsultation)

    // Update doctor status
    const doctor = mockDoctors.get(doctorId)
    if (doctor) {
      doctor.currentLoad += 1
      doctor.status = doctor.currentLoad >= doctor.maxCapacity ? "busy" : "assigned"
    }

    // In a real implementation, emit WebSocket events
    // io.emit('consultation-started', { consultationId, doctorId, patientId: startedConsultation.patient.id })

    return NextResponse.json({
      success: true,
      message: "Consultation started successfully",
      data: {
        consultation: {
          _id: startedConsultation._id,
          status: startedConsultation.status,
          startTime: startedConsultation.startTime,
          patient: {
            _id: startedConsultation.patient.id,
            firstName: startedConsultation.patient.firstName,
            lastName: startedConsultation.patient.lastName
          }
        }
      }
    })

  } catch (error) {
    console.error('Error starting consultation:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to start consultation. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
