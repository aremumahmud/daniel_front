import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration - same as patients endpoint but specifically for "my patients"
const mockPatients = new Map()
const mockDoctorPatientAssignments = new Map()

// Initialize mock patients
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  _id: "550e8400-e29b-41d4-a716-446655440000",
  userId: {
    _id: "550e8400-e29b-41d4-a716-446655440000",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    avatarUrl: null,
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
  assignedDate: "2024-01-01T00:00:00.000Z",
  lastVisit: "2024-01-15T10:00:00.000Z",
  nextAppointment: "2024-01-20T14:00:00.000Z",
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  _id: "660f9511-f3ac-52e5-b827-557766551111",
  userId: {
    _id: "660f9511-f3ac-52e5-b827-557766551111",
    firstName: "Jane",
    lastName: "Smith",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1234567892",
    avatarUrl: null,
    lastLogin: "2024-01-10T14:30:00.000Z"
  },
  age: 28,
  gender: "Female",
  bloodType: "A+",
  allergies: [],
  emergencyContact: {
    name: "Bob Smith",
    relationship: "Father",
    phone: "+1234567893"
  },
  medicalHistory: ["Asthma"],
  currentMedications: ["Albuterol"],
  isActive: true,
  assignedDate: "2024-01-02T00:00:00.000Z",
  lastVisit: "2024-01-10T14:30:00.000Z",
  nextAppointment: null,
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-10T14:30:00.000Z"
})

mockPatients.set("770g0622-g4bd-63f6-c938-668877662222", {
  _id: "770g0622-g4bd-63f6-c938-668877662222",
  userId: {
    _id: "770g0622-g4bd-63f6-c938-668877662222",
    firstName: "Michael",
    lastName: "Johnson",
    fullName: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "+1234567894",
    avatarUrl: null,
    lastLogin: "2024-01-12T09:15:00.000Z"
  },
  age: 42,
  gender: "Male",
  bloodType: "B+",
  allergies: ["Shellfish"],
  emergencyContact: {
    name: "Sarah Johnson",
    relationship: "Wife",
    phone: "+1234567895"
  },
  medicalHistory: ["High Cholesterol"],
  currentMedications: ["Atorvastatin"],
  isActive: true,
  assignedDate: "2024-01-03T00:00:00.000Z",
  lastVisit: "2024-01-12T09:15:00.000Z",
  nextAppointment: "2024-01-25T11:00:00.000Z",
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-12T09:15:00.000Z"
})

// Initialize doctor-patient assignments
// Doctor ID: 770g0622-g4bd-63f6-c938-668877662222 is assigned to patients
mockDoctorPatientAssignments.set("770g0622-g4bd-63f6-c938-668877662222", [
  "550e8400-e29b-41d4-a716-446655440000", // John Doe
  "660f9511-f3ac-52e5-b827-557766551111"  // Jane Smith
])

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'assignedDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Get patients assigned to this doctor
    const assignedPatientIds = mockDoctorPatientAssignments.get(doctorId) || []
    
    // Filter patients based on assignments - only return patients assigned to this doctor
    let myPatients = Array.from(mockPatients.values()).filter((patient: any) => 
      assignedPatientIds.includes(patient._id)
    )

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      myPatients = myPatients.filter((patient: any) => 
        patient.userId?.fullName?.toLowerCase().includes(searchLower) ||
        patient.userId?.email?.toLowerCase().includes(searchLower) ||
        patient.userId?.phone?.includes(search)
      )
    }

    // Apply status filter
    if (status && status !== 'all') {
      myPatients = myPatients.filter((patient: any) => {
        if (status === 'active') return patient.status === 'active' && patient.isActive
        if (status === 'inactive') return patient.status === 'inactive' || !patient.isActive
        if (status === 'pending') return patient.status === 'pending'
        return true
      })
    }

    // Sort patients
    myPatients.sort((a: any, b: any) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.userId?.fullName || ''
          bValue = b.userId?.fullName || ''
          break
        case 'age':
          aValue = a.age || 0
          bValue = b.age || 0
          break
        case 'lastVisit':
          aValue = new Date(a.lastVisit || 0).getTime()
          bValue = new Date(b.lastVisit || 0).getTime()
          break
        case 'nextAppointment':
          aValue = new Date(a.nextAppointment || 0).getTime()
          bValue = new Date(b.nextAppointment || 0).getTime()
          break
        case 'assignedDate':
        default:
          aValue = new Date(a.assignedDate || 0).getTime()
          bValue = new Date(b.assignedDate || 0).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPatients = myPatients.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        patients: paginatedPatients,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(myPatients.length / limit),
          totalRecords: myPatients.length,
          hasNextPage: endIndex < myPatients.length,
          hasPrevPage: page > 1
        },
        summary: {
          totalAssigned: myPatients.length,
          activePatients: myPatients.filter(p => p.status === 'active').length,
          upcomingAppointments: myPatients.filter(p => p.nextAppointment).length
        }
      }
    })

  } catch (error) {
    console.error('Error getting my patients:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get assigned patients",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
