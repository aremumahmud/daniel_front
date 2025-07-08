import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctor capacities data
const mockDoctorCapacities = [
  {
    doctorId: "550e8400-e29b-41d4-a716-446655440003",
    doctorName: "Dr. Jane Smith",
    specialization: "General Medicine",
    isOnline: true,
    isAvailable: true,
    currentPatients: 2,
    maxPatients: 5,
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    averageConsultationTime: 25,
    lastAssignedAt: "2024-01-15T10:30:00.000Z",
    capacityPercentage: 40,
    availabilityStatus: "available"
  },
  {
    doctorId: "550e8400-e29b-41d4-a716-446655440004",
    doctorName: "Dr. Michael Johnson",
    specialization: "Cardiology",
    isOnline: true,
    isAvailable: false,
    currentPatients: 4,
    maxPatients: 4,
    workingHours: {
      start: "08:00",
      end: "16:00"
    },
    averageConsultationTime: 30,
    lastAssignedAt: "2024-01-15T11:00:00.000Z",
    capacityPercentage: 100,
    availabilityStatus: "busy"
  },
  {
    doctorId: "550e8400-e29b-41d4-a716-446655440005",
    doctorName: "Dr. Sarah Wilson",
    specialization: "Pediatrics",
    isOnline: false,
    isAvailable: false,
    currentPatients: 0,
    maxPatients: 6,
    workingHours: {
      start: "10:00",
      end: "18:00"
    },
    averageConsultationTime: 20,
    lastAssignedAt: "2024-01-14T16:30:00.000Z",
    capacityPercentage: 0,
    availabilityStatus: "offline"
  }
]

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

    // Check if user has appropriate role (Admin or Doctor)
    if (!['admin', 'doctor'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or Doctor role required.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: mockDoctorCapacities
    })

  } catch (error) {
    console.error('Error getting doctor capacities:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get doctor capacities. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
