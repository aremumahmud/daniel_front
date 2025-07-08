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
  specialization: "General Medicine"
})

// Initialize a mock consultation
mockConsultations.set("550e8400-e29b-41d4-a716-446655440000", {
  _id: "550e8400-e29b-41d4-a716-446655440000",
  status: "completed",
  startTime: "2024-01-10T14:30:00Z",
  endTime: "2024-01-10T14:55:00Z",
  duration: 25,
  patient: mockPatients.get("660f9511-f3ac-52e5-b827-557766551111"),
  doctor: mockDoctors.get("770g0622-g4bd-63f6-c938-668877662222"),
  queue: {
    _id: "880h1733-h5ce-74g7-d049-779988773333",
    queueNumber: "Q001",
    priority: "normal",
    position: 1
  },
  prescriptions: [
    {
      medication: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      duration: "7 days",
      instructions: "Take with food"
    }
  ],
  diagnosis: [
    {
      condition: "Upper Respiratory Infection",
      icd10Code: "J06.9",
      severity: "mild"
    }
  ],
  notes: "Patient responded well to treatment. Prescribed antibiotics for infection.",
  recommendations: [
    "Rest and hydration",
    "Complete full course of antibiotics"
  ],
  testsOrdered: [],
  referrals: [],
  consultationFee: 150.00
})

export async function GET(
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
    const consultation = mockConsultations.get(consultationId)

    if (!consultation) {
      return NextResponse.json(
        { success: false, message: 'Consultation not found' },
        { status: 404 }
      )
    }

    // Format the consultation data for response
    const consultationDetails = {
      _id: consultation._id,
      status: consultation.status,
      startTime: consultation.startTime,
      endTime: consultation.endTime,
      duration: consultation.duration,
      patient: {
        _id: consultation.patient.id,
        firstName: consultation.patient.firstName,
        lastName: consultation.patient.lastName,
        dateOfBirth: consultation.patient.dateOfBirth,
        gender: consultation.patient.gender,
        phone: consultation.patient.phone,
        email: consultation.patient.email
      },
      doctor: {
        _id: consultation.doctor.id,
        userId: {
          firstName: consultation.doctor.userId.firstName,
          lastName: consultation.doctor.userId.lastName
        },
        specialization: consultation.doctor.specialization
      },
      queue: consultation.queue,
      prescriptions: consultation.prescriptions || [],
      diagnosis: consultation.diagnosis || [],
      notes: consultation.notes,
      recommendations: consultation.recommendations || [],
      testsOrdered: consultation.testsOrdered || [],
      referrals: consultation.referrals || [],
      consultationFee: consultation.consultationFee
    }

    return NextResponse.json({
      success: true,
      data: {
        consultation: consultationDetails
      }
    })

  } catch (error) {
    console.error('Error getting consultation details:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get consultation details. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
