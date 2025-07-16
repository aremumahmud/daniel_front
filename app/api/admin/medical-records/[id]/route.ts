import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Import the same mock data from the main route
// In a real application, this would be a shared database/service
const mockMedicalRecords = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()

// Initialize mock data (same as main route)
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001",
  email: "john.doe@example.com",
  phone: "+1234567890"
})

mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  userId: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Dr. John",
  lastName: "Smith",
  specialization: "Cardiology",
  email: "dr.smith@hospital.com"
})

// Initialize sample record
mockMedicalRecords.set("record-001", {
  _id: "record-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  appointmentId: "apt-001",
  recordDate: new Date("2024-01-15T10:30:00Z").toISOString(),
  recordType: "consultation",
  chiefComplaint: "Chest pain and shortness of breath for 2 days",
  historyOfPresentIllness: "Patient reports substernal chest pain that started 2 days ago",
  vitalSigns: {
    bloodPressure: { systolic: 140, diastolic: 90 },
    heartRate: 88,
    temperature: 98.6,
    respiratoryRate: 18,
    oxygenSaturation: 97,
    weight: 75,
    height: 175,
    bmi: 24.5,
    painScale: 6
  },
  diagnosis: {
    primary: {
      condition: "Unstable Angina",
      icdCode: "I20.0",
      severity: "moderate",
      status: "active"
    },
    secondary: [],
    differential: []
  },
  treatmentPlan: {
    medications: [
      {
        medicationName: "Nitroglycerin",
        dosage: "0.4mg",
        frequency: "PRN",
        route: "sublingual",
        instructions: "Take for chest pain",
        quantity: "25 tablets"
      }
    ],
    procedures: [],
    therapies: []
  },
  labResults: [],
  followUp: {
    required: true,
    timeframe: "1 week",
    type: "office",
    instructions: "Return if symptoms worsen"
  },
  doctorNotes: {
    assessment: "Likely unstable angina",
    plan: "Start medications, follow up",
    patientEducation: "Discussed warning signs",
    warningsSigns: "Return for severe chest pain"
  },
  status: "completed",
  isArchived: false,
  confidentialityLevel: "normal",
  createdAt: new Date("2024-01-15T10:45:00Z").toISOString(),
  updatedAt: new Date("2024-01-15T10:45:00Z").toISOString(),
  createdBy: "admin-user-123",
  lastModifiedBy: "admin-user-123"
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
    if (!user || user.role !== 'admin') {
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

    // Populate patient and doctor data
    const patient = mockPatients.get(record.patientId)
    const doctor = mockDoctors.get(record.doctorId)

    const enrichedRecord = {
      ...record,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber,
        email: patient.email,
        phone: patient.phone
      } : null,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        email: doctor.email
      } : null
    }

    return NextResponse.json({
      success: true,
      data: {
        medicalRecord: enrichedRecord
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
    if (!user || user.role !== 'admin') {
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

    // Create amendment entry for audit trail
    const amendment = {
      amendedBy: user.userId || user.id,
      amendedAt: new Date().toISOString(),
      reason: body.amendmentReason || "Administrative update",
      changes: "Record updated by admin",
      originalValue: JSON.stringify(existingRecord),
      newValue: JSON.stringify(body)
    }

    // Update the record
    const updatedRecord = {
      ...existingRecord,
      ...body,
      _id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      lastModifiedBy: user.userId || user.id,
      amendments: [...(existingRecord.amendments || []), amendment]
    }

    // Store updated record
    mockMedicalRecords.set(id, updatedRecord)

    // Populate related data
    const patient = mockPatients.get(updatedRecord.patientId)
    const doctor = mockDoctors.get(updatedRecord.doctorId)

    const enrichedRecord = {
      ...updatedRecord,
      patient: patient ? {
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber
      } : null,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      } : null
    }

    return NextResponse.json({
      success: true,
      message: "Medical record updated successfully",
      data: {
        medicalRecord: enrichedRecord
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
    if (!user || user.role !== 'admin') {
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

    // Soft delete - mark as archived instead of permanent deletion
    const archivedRecord = {
      ...existingRecord,
      isArchived: true,
      status: "archived",
      updatedAt: new Date().toISOString(),
      lastModifiedBy: user.userId || user.id,
      amendments: [
        ...(existingRecord.amendments || []),
        {
          amendedBy: user.userId || user.id,
          amendedAt: new Date().toISOString(),
          reason: "Record archived by admin",
          changes: "Status changed to archived",
          originalValue: existingRecord.status,
          newValue: "archived"
        }
      ]
    }

    // Update record with archived status
    mockMedicalRecords.set(id, archivedRecord)

    return NextResponse.json({
      success: true,
      message: "Medical record archived successfully",
      data: {
        recordId: id,
        status: "archived"
      }
    })

  } catch (error) {
    console.error('Error deleting medical record:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete medical record",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
