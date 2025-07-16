import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data storage
const mockMedicalRecords = new Map()
const mockPatients = new Map()

// Initialize mock patients
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
      appointmentId,
      chiefComplaint,
      quickDiagnosis,
      quickTreatment,
      followUpDays,
      vitalSigns,
      notes
    } = body

    // Validate required fields
    if (!patientId || !chiefComplaint) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: patientId, chiefComplaint",
          error: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    // Validate patient exists
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

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Generate new record ID
    const recordId = `quick-record-${Date.now()}`
    const now = new Date().toISOString()

    // Calculate follow-up date if specified
    let followUpDate = null
    if (followUpDays && followUpDays > 0) {
      const followUp = new Date()
      followUp.setDate(followUp.getDate() + followUpDays)
      followUpDate = followUp.toISOString()
    }

    // Create quick medical record with simplified structure
    const quickRecord = {
      _id: recordId,
      patientId,
      doctorId,
      appointmentId: appointmentId || null,
      recordType: "consultation",
      recordDate: now,
      visitDate: now,

      // Clinical Information (simplified)
      chiefComplaint,
      presentIllness: `Quick consultation for: ${chiefComplaint}`,
      physicalExamination: notes || "Quick examination performed",

      // Quick diagnosis and treatment
      diagnosis: quickDiagnosis ? [quickDiagnosis] : [],
      treatment: quickTreatment || "",
      
      // Medications (can be added later)
      medications: [],

      // Vital Signs (if provided)
      vitalSigns: {
        bloodPressure: vitalSigns?.bloodPressure || "",
        heartRate: vitalSigns?.heartRate || 0,
        temperature: vitalSigns?.temperature || 0,
        weight: vitalSigns?.weight || 0,
        respiratoryRate: vitalSigns?.respiratoryRate || 0,
        oxygenSaturation: vitalSigns?.oxygenSaturation || 0
      },

      // Follow-up information
      followUp: {
        required: followUpDays ? true : false,
        timeframe: followUpDays ? `${followUpDays} days` : "",
        type: "office",
        instructions: followUpDays ? `Return in ${followUpDays} days for follow-up` : "",
        scheduledDate: followUpDate
      },

      // Doctor notes
      doctorNotes: {
        assessment: quickDiagnosis || "Quick assessment completed",
        plan: quickTreatment || "Treatment plan to be determined",
        patientEducation: "",
        warningsSigns: "",
        additionalNotes: notes || ""
      },

      // Record metadata
      status: "completed",
      isQuickRecord: true,
      confidentialityLevel: "normal",

      // Timestamps
      createdAt: now,
      updatedAt: now,
      createdBy: doctorId,
      lastModifiedBy: doctorId,

      // Patient info for easy access
      patient: {
        userId: {
          fullName: `${patient.firstName} ${patient.lastName}`
        }
      }
    }

    // Store the record
    mockMedicalRecords.set(recordId, quickRecord)

    return NextResponse.json({
      success: true,
      message: "Quick medical record created successfully",
      data: {
        record: quickRecord,
        followUpScheduled: followUpDate ? true : false,
        followUpDate: followUpDate
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating quick medical record:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create quick medical record",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET method to retrieve quick record templates
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

    // Return quick record templates for common conditions
    const quickTemplates = [
      {
        id: "routine-checkup",
        name: "Routine Health Checkup",
        chiefComplaint: "Routine health checkup",
        quickDiagnosis: "General health assessment",
        quickTreatment: "Continue current lifestyle, routine follow-up",
        followUpDays: 90,
        category: "preventive"
      },
      {
        id: "hypertension-followup",
        name: "Hypertension Follow-up",
        chiefComplaint: "Hypertension follow-up",
        quickDiagnosis: "Essential Hypertension",
        quickTreatment: "Continue antihypertensive medication",
        followUpDays: 30,
        category: "chronic"
      },
      {
        id: "diabetes-followup",
        name: "Diabetes Follow-up",
        chiefComplaint: "Diabetes management follow-up",
        quickDiagnosis: "Type 2 Diabetes Mellitus",
        quickTreatment: "Continue diabetes medication, dietary counseling",
        followUpDays: 30,
        category: "chronic"
      },
      {
        id: "cold-symptoms",
        name: "Common Cold",
        chiefComplaint: "Cold symptoms - runny nose, cough",
        quickDiagnosis: "Upper Respiratory Tract Infection",
        quickTreatment: "Symptomatic treatment, rest, fluids",
        followUpDays: 7,
        category: "acute"
      },
      {
        id: "headache",
        name: "Headache",
        chiefComplaint: "Headache",
        quickDiagnosis: "Tension Headache",
        quickTreatment: "Pain relief medication, stress management",
        followUpDays: 14,
        category: "acute"
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        templates: quickTemplates,
        usage: "Select a template to quickly create a medical record with pre-filled common values"
      }
    })

  } catch (error) {
    console.error('Error getting quick record templates:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get quick record templates",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
