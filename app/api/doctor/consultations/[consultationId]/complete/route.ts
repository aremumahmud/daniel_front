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

mockPatients.set("771h1733-h8fh-97j0-g37c-00cc11006666", {
  id: "771h1733-h8fh-97j0-g37c-00cc11006666",
  firstName: "Michael",
  lastName: "Johnson",
  dateOfBirth: "1990-07-22",
  gender: "male",
  phone: "+1234567891",
  email: "michael.johnson@email.com"
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

    const {
      duration,
      notes,
      followUpRequired,
      nextAppointmentDate,
      prescriptions = [],
      diagnosis = [],
      recommendations = [],
      testsOrdered = [],
      referrals = [],
      consultationFee
    } = body

    // Validate required fields
    if (!duration || !notes) {
      return NextResponse.json(
        { success: false, message: 'Duration and notes are required' },
        { status: 400 }
      )
    }

    // Get current consultation (mock data)
    const currentConsultation = {
      _id: consultationId,
      status: "in_progress",
      startTime: new Date(Date.now() - duration * 60000).toISOString(),
      endTime: new Date().toISOString(),
      duration: duration,
      patient: mockPatients.get("660f9511-f3ac-52e5-b827-557766551111"),
      doctor: mockDoctors.get(decoded.doctorId || "770g0622-g4bd-63f6-c938-668877662222"),
      queue: {
        _id: "880h1733-h5ce-74g7-d049-779988773333",
        queueNumber: "Q001",
        priority: "normal",
        position: 1
      }
    }

    // Complete the consultation
    const completedConsultation = {
      ...currentConsultation,
      status: "completed",
      notes,
      followUpRequired,
      nextAppointmentDate,
      prescriptions,
      diagnosis,
      recommendations,
      testsOrdered,
      referrals,
      consultationFee,
      completedAt: new Date().toISOString()
    }

    // Store completed consultation
    mockConsultations.set(consultationId, completedConsultation)

    // Automatic queue management - find next patient
    const nextPatient = mockPatients.get("771h1733-h8fh-97j0-g37c-00cc11006666")
    const doctor = mockDoctors.get(decoded.doctorId || "770g0622-g4bd-63f6-c938-668877662222")

    // Update doctor status
    if (doctor) {
      doctor.currentLoad = Math.max(0, doctor.currentLoad - 1)
      doctor.status = doctor.currentLoad >= doctor.maxCapacity ? "busy" : "available"
    }

    // Auto-assign next patient if available
    let nextPatientAssigned = null
    if (nextPatient && doctor && doctor.status === "available") {
      nextPatientAssigned = {
        patientId: nextPatient.id,
        patientName: `${nextPatient.firstName} ${nextPatient.lastName}`,
        doctorId: doctor.id,
        doctorName: `Dr. ${doctor.userId.lastName}`,
        estimatedStartTime: new Date(Date.now() + 5 * 60000).toISOString() // 5 minutes from now
      }

      // Update doctor load
      doctor.currentLoad += 1
      doctor.status = doctor.currentLoad >= doctor.maxCapacity ? "busy" : "assigned"
    }

    // In a real implementation, emit WebSocket events
    // io.emit('consultation-completed', { consultationId, doctorId: doctor.id, nextPatientAssigned })
    // if (nextPatientAssigned) {
    //   io.emit('patient-auto-assigned', nextPatientAssigned)
    // }

    return NextResponse.json({
      success: true,
      message: "Consultation completed successfully",
      data: {
        consultationId: consultationId,
        nextPatientAssigned: nextPatientAssigned,
        doctorStatus: doctor?.status || "available"
      }
    })

  } catch (error) {
    console.error('Error completing consultation:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to complete consultation. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
