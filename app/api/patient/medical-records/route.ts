import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock medical records data for demonstration
const mockMedicalRecords = new Map()

// Initialize some mock medical records
mockMedicalRecords.set("550e8400-e29b-41d4-a716-446655440002", {
  _id: "550e8400-e29b-41d4-a716-446655440002",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  recordType: "consultation",
  recordDate: "2024-01-15T10:00:00.000Z",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  diagnosis: [
    {
      code: "Z00.00",
      description: "General health checkup",
      severity: "routine"
    }
  ],
  symptoms: ["No specific symptoms"],
  medications: [
    {
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "daily",
      duration: "30 days",
      instructions: "Take with food"
    }
  ],
  labResults: [
    {
      testName: "Complete Blood Count",
      result: "Normal",
      referenceRange: "Normal values",
      date: "2024-01-14T09:00:00.000Z"
    }
  ],
  vitalSigns: {
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 98.6,
    weight: 73.2
  },
  notes: "Patient in good health, continue current lifestyle",
  followUpRequired: false,
  nextAppointment: "2024-04-15T10:00:00.000Z",
  createdAt: "2024-01-15T10:00:00.000Z"
})

mockMedicalRecords.set("record-002", {
  _id: "record-002",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  recordType: "lab_result",
  recordDate: "2024-01-10T09:00:00.000Z",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  diagnosis: [
    {
      code: "Z01.812",
      description: "Encounter for preprocedural laboratory examination",
      severity: "routine"
    }
  ],
  symptoms: [],
  medications: [],
  labResults: [
    {
      testName: "Lipid Panel",
      result: "Total Cholesterol: 180 mg/dL",
      referenceRange: "< 200 mg/dL",
      date: "2024-01-10T09:00:00.000Z"
    },
    {
      testName: "Blood Glucose",
      result: "95 mg/dL",
      referenceRange: "70-100 mg/dL",
      date: "2024-01-10T09:00:00.000Z"
    }
  ],
  vitalSigns: {},
  notes: "All lab results within normal limits",
  followUpRequired: false,
  createdAt: "2024-01-10T09:00:00.000Z"
})

mockMedicalRecords.set("record-003", {
  _id: "record-003",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  recordType: "prescription",
  recordDate: "2024-01-05T14:00:00.000Z",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  doctorName: "Dr. Jane Smith",
  diagnosis: [
    {
      code: "M25.50",
      description: "Pain in unspecified joint",
      severity: "mild"
    }
  ],
  symptoms: ["Joint pain", "Mild stiffness"],
  medications: [
    {
      name: "Ibuprofen",
      dosage: "400 mg",
      frequency: "twice daily",
      duration: "7 days",
      instructions: "Take with food to avoid stomach upset"
    }
  ],
  labResults: [],
  vitalSigns: {},
  notes: "Prescribed anti-inflammatory for joint pain. Follow up if symptoms persist.",
  followUpRequired: true,
  nextAppointment: "2024-01-20T14:00:00.000Z",
  createdAt: "2024-01-05T14:00:00.000Z"
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

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const recordType = searchParams.get('recordType')
    const doctorId = searchParams.get('doctorId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      patientId = searchParams.get('patientId') || patientId
    }

    // Filter records by patient
    let filteredRecords = Array.from(mockMedicalRecords.values())
      .filter((record: any) => record.patientId === patientId)

    // Apply filters
    if (recordType) {
      filteredRecords = filteredRecords.filter((record: any) => record.recordType === recordType)
    }

    if (doctorId) {
      filteredRecords = filteredRecords.filter((record: any) => record.doctorId === doctorId)
    }

    if (startDate) {
      filteredRecords = filteredRecords.filter((record: any) => 
        new Date(record.recordDate) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredRecords = filteredRecords.filter((record: any) => 
        new Date(record.recordDate) <= new Date(endDate)
      )
    }

    // Sort records by date (most recent first)
    filteredRecords.sort((a: any, b: any) => 
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
    )

    // Calculate pagination
    const totalRecords = filteredRecords.length
    const totalPages = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

    // Remove sensitive details for list view
    const simplifiedRecords = paginatedRecords.map((record: any) => ({
      _id: record._id,
      recordType: record.recordType,
      recordDate: record.recordDate,
      doctorId: record.doctorId,
      doctorName: record.doctorName,
      diagnosis: record.diagnosis,
      symptoms: record.symptoms,
      medications: record.medications,
      notes: record.notes,
      followUpRequired: record.followUpRequired
    }))

    return NextResponse.json({
      success: true,
      data: {
        records: simplifiedRecords,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalRecords: totalRecords
        }
      }
    })

  } catch (error) {
    console.error('Error getting medical records:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get medical records. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
