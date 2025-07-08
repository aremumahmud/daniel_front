import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
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
  currentLoad: 1,
  maxCapacity: 5,
  status: "busy"
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

    // Check if user is a doctor
    if (decoded.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    const doctorId = decoded.doctorId || "770g0622-g4bd-63f6-c938-668877662222"
    const doctor = mockDoctors.get(doctorId)

    // Check if doctor has a current consultation
    if (!doctor || doctor.currentLoad === 0) {
      return NextResponse.json({
        success: true,
        data: {
          consultation: null
        }
      })
    }

    // Mock current consultation data
    const currentConsultation = {
      _id: "550e8400-e29b-41d4-a716-446655440000",
      status: "in_progress",
      startTime: new Date(Date.now() - 15 * 60000).toISOString(), // Started 15 minutes ago
      estimatedDuration: 30,
      patient: {
        _id: "660f9511-f3ac-52e5-b827-557766551111",
        firstName: "Jane",
        lastName: "Smith"
      },
      queue: {
        _id: "880h1733-h5ce-74g7-d049-779988773333",
        queueNumber: "Q001",
        priority: "normal"
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        consultation: currentConsultation
      }
    })

  } catch (error) {
    console.error('Error getting current consultation:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get current consultation. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
