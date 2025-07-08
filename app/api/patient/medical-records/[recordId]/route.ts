import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock medical records data for demonstration (shared with main medical-records route)
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
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
})

mockMedicalRecords.set("record-lab-001", {
  _id: "record-lab-001",
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
      result: "Total Cholesterol: 180 mg/dL, HDL: 55 mg/dL, LDL: 110 mg/dL, Triglycerides: 120 mg/dL",
      referenceRange: "Total < 200 mg/dL, HDL > 40 mg/dL, LDL < 130 mg/dL, Triglycerides < 150 mg/dL",
      date: "2024-01-10T09:00:00.000Z",
      status: "normal"
    },
    {
      testName: "Blood Glucose (Fasting)",
      result: "95 mg/dL",
      referenceRange: "70-100 mg/dL",
      date: "2024-01-10T09:00:00.000Z",
      status: "normal"
    },
    {
      testName: "Hemoglobin A1C",
      result: "5.2%",
      referenceRange: "< 5.7%",
      date: "2024-01-10T09:00:00.000Z",
      status: "normal"
    }
  ],
  vitalSigns: {
    bloodPressure: "118/76",
    heartRate: 68,
    temperature: 98.4,
    weight: 72.8
  },
  notes: "All lab results within normal limits. Patient shows excellent metabolic health. Continue current diet and exercise routine.",
  followUpRequired: false,
  nextAppointment: "2024-07-10T09:00:00.000Z",
  createdAt: "2024-01-10T09:00:00.000Z",
  updatedAt: "2024-01-10T09:00:00.000Z",
  additionalInfo: {
    labOrderedBy: "Dr. Jane Smith",
    labProcessedBy: "City Medical Lab",
    labOrderNumber: "LAB-2024-001234",
    fastingHours: 12,
    specimenType: "Blood serum"
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
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

    const { recordId } = params

    // Find the medical record
    const medicalRecord = mockMedicalRecords.get(recordId)
    if (!medicalRecord) {
      return NextResponse.json(
        { success: false, message: 'Medical record not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to view this record
    const userPatientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'patient' && medicalRecord.patientId !== userPatientId) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only view your own medical records.' },
        { status: 403 }
      )
    }

    // For doctors, check if they have access to this patient's records
    if (decoded.role === 'doctor') {
      // In a real system, you would check if the doctor has permission to view this patient's records
      // For now, we'll allow all doctors to view records
    }

    return NextResponse.json({
      success: true,
      data: medicalRecord
    })

  } catch (error) {
    console.error('Error getting medical record:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get medical record. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
