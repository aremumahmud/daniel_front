import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctors data for demonstration
const mockDoctors = [
  {
    _id: "550e8400-e29b-41d4-a716-446655440003",
    userId: "550e8400-e29b-41d4-a716-446655440004",
    firstName: "Dr. Jane",
    lastName: "Smith",
    specialization: "General Medicine",
    isOnline: true,
    isAvailable: true,
    currentPatients: 2,
    maxPatients: 8,
    averageConsultationTime: 25,
    estimatedAvailableAt: "2024-01-15T11:30:00.000Z",
    workingHours: {
      start: "09:00",
      end: "17:00"
    }
  },
  {
    _id: "661f0622-f4bd-53f6-c938-668877662222",
    userId: "661f0622-f4bd-53f6-c938-668877662223",
    firstName: "Dr. Michael",
    lastName: "Johnson",
    specialization: "Cardiology",
    isOnline: true,
    isAvailable: true,
    currentPatients: 1,
    maxPatients: 5,
    averageConsultationTime: 40,
    estimatedAvailableAt: "2024-01-15T11:15:00.000Z",
    workingHours: {
      start: "08:00",
      end: "16:00"
    }
  },
  {
    _id: "772i2844-i9gi-08k1-h48d-11dd22117777",
    userId: "772i2844-i9gi-08k1-h48d-11dd22117778",
    firstName: "Dr. Sarah",
    lastName: "Wilson",
    specialization: "Pediatrics",
    isOnline: true,
    isAvailable: false, // At capacity
    currentPatients: 4,
    maxPatients: 4,
    averageConsultationTime: 20,
    estimatedAvailableAt: "2024-01-15T12:00:00.000Z",
    workingHours: {
      start: "10:00",
      end: "18:00"
    }
  },
  {
    _id: "883j3955-j0hj-19l2-i59e-22ee33228888",
    userId: "883j3955-j0hj-19l2-i59e-22ee33228889",
    firstName: "Dr. Robert",
    lastName: "Davis",
    specialization: "General Medicine",
    isOnline: false, // Offline
    isAvailable: false,
    currentPatients: 0,
    maxPatients: 6,
    averageConsultationTime: 35,
    estimatedAvailableAt: null,
    workingHours: {
      start: "09:30",
      end: "17:30"
    }
  },
  {
    _id: "994k5177-k2jk-e1n4-k71g-eeffaaaa9999",
    userId: "994k5177-k2jk-e1n4-k71g-eeffaaaa9998",
    firstName: "Dr. Emily",
    lastName: "Brown",
    specialization: "Dermatology",
    isOnline: true,
    isAvailable: true,
    currentPatients: 0,
    maxPatients: 3,
    averageConsultationTime: 15,
    estimatedAvailableAt: "2024-01-15T11:00:00.000Z",
    workingHours: {
      start: "11:00",
      end: "19:00"
    }
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const includeCapacity = searchParams.get('includeCapacity') === 'true'

    // Filter doctors based on query parameters
    let filteredDoctors = [...mockDoctors]

    // Filter by specialization if provided
    if (specialization) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
      )
    }

    // Filter to only show online doctors (available or busy)
    filteredDoctors = filteredDoctors.filter(doctor => doctor.isOnline)

    // Format response data
    const doctorsData = filteredDoctors.map(doctor => {
      const baseData = {
        _id: doctor._id,
        userId: doctor.userId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        isOnline: doctor.isOnline,
        isAvailable: doctor.isAvailable,
        workingHours: doctor.workingHours
      }

      // Include capacity information if requested
      if (includeCapacity) {
        return {
          ...baseData,
          currentPatients: doctor.currentPatients,
          maxPatients: doctor.maxPatients,
          averageConsultationTime: doctor.averageConsultationTime,
          estimatedAvailableAt: doctor.estimatedAvailableAt
        }
      }

      return baseData
    })

    // Sort by availability (available first), then by current load
    doctorsData.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1
      if (!a.isAvailable && b.isAvailable) return 1
      
      if (includeCapacity && 'currentPatients' in a && 'currentPatients' in b) {
        return a.currentPatients - b.currentPatients
      }
      
      return 0
    })

    return NextResponse.json({
      success: true,
      data: doctorsData
    })

  } catch (error) {
    console.error('Error getting available doctors:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get available doctors. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
