import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockMedicalRecords = new Map()
const mockPatients = new Map()

// Initialize mock patients
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  userId: {
    _id: "550e8400-e29b-41d4-a716-446655440000",
    fullName: "John Doe"
  }
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  userId: {
    _id: "660f9511-f3ac-52e5-b827-557766551111",
    fullName: "Jane Smith"
  }
})

// Initialize some mock medical records
mockMedicalRecords.set("record-001", {
  _id: "record-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  recordType: "consultation",
  visitDate: "2024-01-15T10:00:00.000Z",
  chiefComplaint: "Regular checkup",
  diagnosis: [
    {
      primary: true,
      code: "Z00.00",
      description: "General health checkup"
    }
  ],
  treatment: "Continue current lifestyle",
  medications: [
    {
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "daily",
      duration: "30 days",
      instructions: "Take with food"
    }
  ],
  vitalSigns: {
    bloodPressure: { systolic: 120, diastolic: 80 },
    heartRate: 72,
    temperature: 98.6,
    weight: 73.2
  },
  patient: {
    userId: {
      fullName: "John Doe"
    }
  },
  createdAt: "2024-01-15T10:00:00.000Z"
})

mockMedicalRecords.set("record-002", {
  _id: "record-002",
  patientId: "660f9511-f3ac-52e5-b827-557766551111",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  recordType: "follow-up",
  visitDate: "2024-01-10T14:30:00.000Z",
  chiefComplaint: "Follow-up on chest pain",
  diagnosis: [
    {
      primary: true,
      code: "R06.02",
      description: "Shortness of breath"
    }
  ],
  treatment: "Prescribed medication and rest",
  medications: [
    {
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "twice daily",
      duration: "7 days",
      instructions: "Take with food"
    }
  ],
  vitalSigns: {
    bloodPressure: { systolic: 130, diastolic: 85 },
    heartRate: 78,
    temperature: 99.1,
    weight: 65.5
  },
  patient: {
    userId: {
      fullName: "Jane Smith"
    }
  },
  createdAt: "2024-01-10T14:30:00.000Z"
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const recordType = searchParams.get('recordType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Filter records for this doctor
    let filteredRecords = Array.from(mockMedicalRecords.values()).filter((record: any) => 
      record.doctorId === doctorId
    )

    // Apply additional filters
    if (patientId) {
      filteredRecords = filteredRecords.filter((record: any) => record.patientId === patientId)
    }

    if (recordType && recordType !== 'all') {
      filteredRecords = filteredRecords.filter((record: any) => record.recordType === recordType)
    }

    // Sort by date (newest first)
    filteredRecords.sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredRecords.length / limit),
          totalRecords: filteredRecords.length,
          hasNextPage: endIndex < filteredRecords.length,
          hasPrevPage: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Error getting medical records:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get medical records",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      patientId,
      recordType,
      chiefComplaint,
      diagnosis,
      treatment,
      medications,
      vitalSigns,
      presentIllness,
      physicalExamination
    } = body

    // Validate required fields
    if (!patientId || !recordType || !chiefComplaint || !diagnosis || !treatment) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: patientId, recordType, chiefComplaint, diagnosis, treatment"
        },
        { status: 400 }
      )
    }

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Generate new record ID
    const recordId = `record-${Date.now()}`

    // Get patient info
    const patient = mockPatients.get(patientId)

    // Create new medical record
    const newRecord = {
      _id: recordId,
      patientId,
      doctorId,
      recordType,
      visitDate: new Date().toISOString(),
      chiefComplaint,
      presentIllness: presentIllness || "",
      physicalExamination: physicalExamination || "",
      diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis],
      treatment,
      medications: medications || [],
      vitalSigns: vitalSigns || {},
      patient: patient ? {
        userId: {
          fullName: `${patient.firstName} ${patient.lastName}`
        }
      } : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Store the new record
    mockMedicalRecords.set(recordId, newRecord)

    return NextResponse.json({
      success: true,
      message: "Medical record created successfully",
      data: newRecord
    })

  } catch (error) {
    console.error('Error creating medical record:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create medical record",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
