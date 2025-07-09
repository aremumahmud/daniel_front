import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock patient data for demonstration
const mockPatients = new Map()

// Initialize mock patient data
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  _id: "550e8400-e29b-41d4-a716-446655440000",
  userId: {
    _id: "550e8400-e29b-41d4-a716-446655440000",
    email: "patient@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "patient",
    emailVerified: true,
    avatarUrl: null,
    isActive: true,
    fullName: "John Doe",
    phone: "+1234567892",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
    lastLogin: "2024-01-15T10:00:00.000Z"
  },
  age: 35,
  gender: "Male",
  bloodType: "O+",
  allergies: ["Penicillin"],
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "+1234567891"
  },
  medicalHistory: ["Hypertension", "Diabetes Type 2"],
  currentMedications: ["Metformin", "Lisinopril"],
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
    if (!user || user.role !== 'patient') {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    // Get the patient's ID from the token
    const patientId = user.userId || user.id

    // Get patient data from mock database
    const patient = mockPatients.get(patientId)
    
    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found",
          error: "PATIENT_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        patient: patient
      }
    })

  } catch (error) {
    console.error('Get patient profile error:', error)
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
