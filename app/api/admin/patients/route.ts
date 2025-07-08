import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock patients data for demonstration
const mockPatients = new Map()

// Initialize mock patients
mockPatients.set("patient-001", {
  id: "patient-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  dateOfBirth: "1990-01-01",
  gender: "male",
  address: "123 Main St, City, State",
  status: "active",
  emergencyContact: {
    name: "Jane Doe",
    phone: "+1234567891",
    relationship: "spouse"
  },
  medicalHistory: {
    allergies: ["Penicillin"],
    conditions: ["Hypertension"],
    medications: ["Lisinopril 10mg"]
  },
  createdAt: "2024-01-10T08:00:00.000Z",
  lastVisit: "2024-01-14T10:30:00.000Z"
})

mockPatients.set("patient-002", {
  id: "patient-002",
  firstName: "Alice",
  lastName: "Johnson",
  email: "alice.johnson@example.com",
  phone: "+1234567892",
  dateOfBirth: "1985-05-15",
  gender: "female",
  address: "456 Oak Ave, City, State",
  status: "active",
  emergencyContact: {
    name: "Bob Johnson",
    phone: "+1234567893",
    relationship: "husband"
  },
  medicalHistory: {
    allergies: [],
    conditions: ["Diabetes Type 2"],
    medications: ["Metformin 500mg"]
  },
  createdAt: "2024-01-08T09:15:00.000Z",
  lastVisit: "2024-01-13T14:20:00.000Z"
})

mockPatients.set("patient-003", {
  id: "patient-003",
  firstName: "Robert",
  lastName: "Brown",
  email: "robert.brown@example.com",
  phone: "+1234567894",
  dateOfBirth: "1975-12-03",
  gender: "male",
  address: "789 Pine St, City, State",
  status: "active",
  emergencyContact: {
    name: "Mary Brown",
    phone: "+1234567895",
    relationship: "wife"
  },
  medicalHistory: {
    allergies: ["Shellfish"],
    conditions: [],
    medications: []
  },
  createdAt: "2024-01-12T11:00:00.000Z",
  lastVisit: "2024-01-15T09:45:00.000Z"
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
    const search = searchParams.get('search')
    const gender = searchParams.get('gender')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Filter patients based on query parameters
    let filteredPatients = Array.from(mockPatients.values())

    // Filter by status
    if (status) {
      filteredPatients = filteredPatients.filter(patient => patient.status === status)
    }

    // Filter by gender
    if (gender) {
      filteredPatients = filteredPatients.filter(patient => patient.gender === gender)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPatients = filteredPatients.filter(patient => 
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(search)
      )
    }

    // Calculate pagination
    const total = filteredPatients.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedPatients = filteredPatients.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        patients: paginatedPatients,
        pagination: {
          total,
          page,
          totalPages,
          totalPatients: total
        }
      }
    })

  } catch (error) {
    console.error('Error getting patients:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get patients. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
