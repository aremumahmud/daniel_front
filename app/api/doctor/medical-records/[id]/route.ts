import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data - should be shared with main route
const mockMedicalRecords = new Map()
const mockPatients = new Map()

// Initialize mock data
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001",
  email: "john.doe@example.com",
  phone: "+1234567890"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  matricNumber: "2024/CS/002",
  email: "jane.smith@example.com",
  phone: "+1234567891"
})

// Initialize sample medical record
mockMedicalRecords.set("record-001", {
  _id: "record-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  recordType: "consultation",
  visitDate: new Date("2024-01-15T10:30:00Z").toISOString(),
  chiefComplaint: "Chest pain and shortness of breath",
  presentIllness: "Patient reports substernal chest pain that started 2 days ago",
  physicalExamination: "Alert and oriented, appears uncomfortable. Heart rate regular.",
  diagnosis: ["Unstable Angina", "Hypertension"],
  treatment: "Start beta-blocker, nitroglycerin PRN",
  medications: [
    {
      name: "Nitroglycerin",
      dosage: "0.4mg",
      frequency: "PRN",
      instructions: "Take for chest pain"
    },
    {
      name: "Metoprolol",
      dosage: "25mg",
      frequency: "twice daily",
      instructions: "Take with food"
    }
  ],
  vitalSigns: {
    bloodPressure: "140/90",
    heartRate: 88,
    temperature: 98.6,
    weight: 75
  },
  createdAt: new Date("2024-01-15T10:45:00Z").toISOString(),
  updatedAt: new Date("2024-01-15T10:45:00Z").toISOString()
})

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const doctorId = user.userId || user.id

    // Get the medical record
    const record = mockMedicalRecords.get(id)
    if (!record) {
      return NextResponse.json(
        {
          success: false,
          message: "Medical record not found",
          error: "RECORD_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Check if doctor owns this record
    if (record.doctorId !== doctorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. You can only view your own records.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      )
    }

    // Get patient info
    const patient = mockPatients.get(record.patientId)

    const enrichedRecord = {
      ...record,
      patient: patient ? {
        userId: {
          fullName: `${patient.firstName} ${patient.lastName}`
        },
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber,
        email: patient.email,
        phone: patient.phone
      } : null
    }

    return NextResponse.json({
      success: true,
      data: {
        record: enrichedRecord
      }
    })

  } catch (error) {
    console.error('Error getting medical record:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get medical record",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const doctorId = user.userId || user.id

    // Get existing record
    const existingRecord = mockMedicalRecords.get(id)
    if (!existingRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Medical record not found",
          error: "RECORD_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Check if doctor owns this record
    if (existingRecord.doctorId !== doctorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. You can only update your own records.",
          error: "FORBIDDEN"
        },
        { status: 403 }
      )
    }

    // Update the record
    const updatedRecord = {
      ...existingRecord,
      ...body,
      _id: id, // Ensure ID doesn't change
      doctorId: doctorId, // Ensure doctor ID doesn't change
      patientId: existingRecord.patientId, // Ensure patient ID doesn't change
      updatedAt: new Date().toISOString()
    }

    // Store updated record
    mockMedicalRecords.set(id, updatedRecord)

    // Get patient info for response
    const patient = mockPatients.get(updatedRecord.patientId)

    const enrichedRecord = {
      ...updatedRecord,
      patient: patient ? {
        userId: {
          fullName: `${patient.firstName} ${patient.lastName}`
        },
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber
      } : null
    }

    return NextResponse.json({
      success: true,
      message: "Medical record updated successfully",
      data: {
        record: enrichedRecord
      }
    })

  } catch (error) {
    console.error('Error updating medical record:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update medical record",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
