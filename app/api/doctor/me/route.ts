import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctor data for demonstration
const mockDoctors = new Map()

// Initialize mock doctor data
mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  _id: "770g0622-g4bd-63f6-c938-668877662222",
  userId: {
    _id: "770g0622-g4bd-63f6-c938-668877662222",
    email: "doctor@example.com",
    firstName: "Dr. John",
    lastName: "Smith",
    role: "doctor",
    emailVerified: true,
    avatarUrl: null,
    isActive: true,
    fullName: "Dr. John Smith",
    phone: "+1234567890",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
    lastLogin: "2024-01-15T10:00:00.000Z"
  },
  specialization: "General Medicine",
  licenseNumber: "MD-12345",
  consultationFee: 150,
  experience: 10,
  education: "MD from Harvard Medical School",
  availability: {
    monday: { start: "09:00", end: "17:00" },
    tuesday: { start: "09:00", end: "17:00" },
    wednesday: { start: "09:00", end: "17:00" },
    thursday: { start: "09:00", end: "17:00" },
    friday: { start: "09:00", end: "17:00" },
    saturday: { start: "09:00", end: "13:00" },
    sunday: { start: null, end: null }
  },
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
})

mockDoctors.set("990i2844-i6df-85h8-e150-880099884444", {
  _id: "990i2844-i6df-85h8-e150-880099884444",
  userId: {
    _id: "990i2844-i6df-85h8-e150-880099884444",
    email: "aremumahmud20031@gmail.com",
    firstName: "Dr. Aremu",
    lastName: "Mahmud",
    role: "doctor",
    emailVerified: true,
    avatarUrl: null,
    isActive: true,
    fullName: "Dr. Aremu Mahmud",
    phone: "+1234567893",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
    lastLogin: "2024-01-15T10:00:00.000Z"
  },
  specialization: "Internal Medicine",
  licenseNumber: "MD-67890",
  consultationFee: 175,
  experience: 8,
  education: "MD from University of Lagos",
  availability: {
    monday: { start: "08:00", end: "16:00" },
    tuesday: { start: "08:00", end: "16:00" },
    wednesday: { start: "08:00", end: "16:00" },
    thursday: { start: "08:00", end: "16:00" },
    friday: { start: "08:00", end: "16:00" },
    saturday: { start: "09:00", end: "12:00" },
    sunday: { start: null, end: null }
  },
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
})

// Helper function to extract JWT token and user info
function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
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

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Get doctor data from mock database
    const doctor = mockDoctors.get(doctorId)
    
    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor not found",
          error: "DOCTOR_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        doctor: doctor
      }
    })

  } catch (error) {
    console.error('Get doctor profile error:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
