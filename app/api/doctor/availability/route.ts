import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mock doctor availability data
const mockDoctorAvailability = {
  "770g0622-g4bd-63f6-c938-668877662222": {
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    name: "Dr. John Doe",
    isOnline: true,
    isAvailable: true,
    currentPatients: 1,
    maxPatients: 5,
    averageConsultationTime: 30,
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    status: "available"
  },
  "881i4733-i8gh-74j0-g37d-11dd22117777": {
    doctorId: "881i4733-i8gh-74j0-g37d-11dd22117777",
    name: "Dr. Jane Smith",
    isOnline: true,
    isAvailable: false,
    currentPatients: 3,
    maxPatients: 4,
    averageConsultationTime: 25,
    workingHours: {
      start: "08:00",
      end: "16:00"
    },
    status: "busy"
  }
}

// Helper function to extract JWT token and user info
function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  // In a real implementation, you would verify and decode the JWT token
  return {
    id: "770g0622-g4bd-63f6-c938-668877662222",
    role: "doctor",
    firstName: "John",
    lastName: "Doe",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222"
  }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authorization)
    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    // Get availability data for this doctor
    const availability = mockDoctorAvailability[user.doctorId]
    
    if (!availability) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor availability data not found",
          error: "NOT_FOUND"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: availability
    })

  } catch (error) {
    console.error('Error getting doctor availability:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get doctor availability",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
