import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock medical records data - should match the comprehensive schema from documentation
const mockMedicalRecords = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()

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

// Initialize mock doctors
mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  userId: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Dr. John",
  lastName: "Smith",
  specialization: "Cardiology",
  email: "dr.smith@hospital.com"
})

// Initialize comprehensive mock medical records
mockMedicalRecords.set("record-001", {
  _id: "record-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  appointmentId: "apt-001",
  recordDate: new Date("2024-01-15T10:30:00Z").toISOString(),
  recordType: "consultation",
  
  // Clinical Information
  chiefComplaint: "Chest pain and shortness of breath for 2 days",
  historyOfPresentIllness: "Patient reports substernal chest pain that started 2 days ago, worsens with exertion",
  reviewOfSystems: {
    cardiovascular: "Chest pain, palpitations",
    respiratory: "Shortness of breath on exertion",
    gastrointestinal: "No nausea or vomiting"
  },
  physicalExamination: {
    general: "Alert and oriented, appears uncomfortable",
    cardiovascular: "Regular rate and rhythm, no murmurs",
    respiratory: "Clear to auscultation bilaterally",
    abdomen: "Soft, non-tender, no organomegaly"
  },

  // Vital Signs
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

  // Diagnosis
  diagnosis: {
    primary: {
      condition: "Unstable Angina",
      icdCode: "I20.0",
      severity: "moderate",
      onset: new Date("2024-01-13T00:00:00Z").toISOString(),
      status: "active"
    },
    secondary: [
      {
        condition: "Hypertension",
        icdCode: "I10",
        severity: "mild",
        status: "chronic"
      }
    ],
    differential: [
      {
        condition: "Myocardial Infarction",
        probability: "low",
        notes: "Troponin negative, ECG normal"
      }
    ]
  },

  // Treatment Plan
  treatmentPlan: {
    medications: [
      {
        medicationName: "Nitroglycerin",
        dosage: "0.4mg",
        frequency: "PRN",
        duration: "30 days",
        route: "sublingual",
        instructions: "Take for chest pain, may repeat x2",
        refills: 2,
        quantity: "25 tablets",
        genericAllowed: true
      },
      {
        medicationName: "Metoprolol",
        dosage: "25mg",
        frequency: "twice daily",
        duration: "30 days",
        route: "oral",
        instructions: "Take with food",
        refills: 2,
        quantity: "60 tablets",
        genericAllowed: true
      }
    ],
    procedures: [
      {
        procedureName: "Electrocardiogram",
        cptCode: "93000",
        scheduledDate: new Date("2024-01-15T11:00:00Z").toISOString(),
        urgency: "urgent",
        instructions: "12-lead ECG stat",
        location: "Cardiology Lab"
      }
    ],
    therapies: []
  },

  // Lab Results
  labResults: [
    {
      testName: "Troponin I",
      testCode: "TROP",
      result: "0.02",
      normalRange: "<0.04",
      unit: "ng/mL",
      abnormal: false,
      criticalValue: false,
      testDate: new Date("2024-01-15T11:00:00Z").toISOString(),
      labFacility: "Hospital Lab",
      notes: "Normal cardiac enzymes"
    }
  ],

  // Follow-up
  followUp: {
    required: true,
    timeframe: "1 week",
    type: "office",
    instructions: "Return if symptoms worsen or persist",
    scheduledDate: new Date("2024-01-22T10:30:00Z").toISOString()
  },

  // Doctor Notes
  doctorNotes: {
    assessment: "Likely unstable angina with hypertension",
    plan: "Start beta-blocker, nitroglycerin PRN, cardiology referral",
    patientEducation: "Discussed cardiac risk factors and warning signs",
    warningsSigns: "Return immediately for severe chest pain, SOB, or syncope",
    additionalNotes: "Patient counseled on lifestyle modifications"
  },

  // Billing Information
  billing: {
    encounterType: "office visit",
    cptCodes: ["99214"],
    icdCodes: ["I20.0", "I10"],
    modifiers: [],
    levelOfService: "4"
  },

  // Record Management
  status: "completed",
  isArchived: false,
  confidentialityLevel: "normal",

  // Audit Trail
  amendments: [],
  reviewedBy: null,
  reviewedAt: null,
  reviewNotes: "",

  // Timestamps
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

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const patientId = searchParams.get('patientId')
    const doctorId = searchParams.get('doctorId')
    const recordType = searchParams.get('recordType')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const sortBy = searchParams.get('sortBy') || 'recordDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Get all records
    let filteredRecords = Array.from(mockMedicalRecords.values())

    // Apply search filter
    if (search) {
      filteredRecords = filteredRecords.filter((record: any) =>
        record.chiefComplaint?.toLowerCase().includes(search.toLowerCase()) ||
        record.diagnosis?.primary?.condition?.toLowerCase().includes(search.toLowerCase()) ||
        record.doctorNotes?.assessment?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply filters
    if (patientId) {
      filteredRecords = filteredRecords.filter((record: any) => record.patientId === patientId)
    }

    if (doctorId) {
      filteredRecords = filteredRecords.filter((record: any) => record.doctorId === doctorId)
    }

    if (recordType) {
      filteredRecords = filteredRecords.filter((record: any) => record.recordType === recordType)
    }

    if (status) {
      filteredRecords = filteredRecords.filter((record: any) => record.status === status)
    }

    // Date range filter
    if (dateFrom) {
      filteredRecords = filteredRecords.filter((record: any) =>
        new Date(record.recordDate) >= new Date(dateFrom)
      )
    }

    if (dateTo) {
      filteredRecords = filteredRecords.filter((record: any) =>
        new Date(record.recordDate) <= new Date(dateTo)
      )
    }

    // Sort records
    filteredRecords.sort((a: any, b: any) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortOrder === 'desc') {
        return new Date(bValue).getTime() - new Date(aValue).getTime()
      } else {
        return new Date(aValue).getTime() - new Date(bValue).getTime()
      }
    })

    // Pagination
    const totalRecords = filteredRecords.length
    const totalPages = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

    // Populate patient and doctor data
    const enrichedRecords = paginatedRecords.map((record: any) => {
      const patient = mockPatients.get(record.patientId)
      const doctor = mockDoctors.get(record.doctorId)
      
      return {
        ...record,
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
    })

    // Generate summary statistics
    const summary = {
      totalRecords: totalRecords,
      recordTypes: filteredRecords.reduce((acc: any, record: any) => {
        acc[record.recordType] = (acc[record.recordType] || 0) + 1
        return acc
      }, {}),
      statusDistribution: filteredRecords.reduce((acc: any, record: any) => {
        acc[record.status] = (acc[record.status] || 0) + 1
        return acc
      }, {})
    }

    return NextResponse.json({
      success: true,
      data: {
        medicalRecords: enrichedRecords,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        summary
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

    const body = await request.json()
    const {
      patientId,
      doctorId,
      appointmentId,
      recordType,
      chiefComplaint,
      historyOfPresentIllness,
      reviewOfSystems,
      physicalExamination,
      vitalSigns,
      diagnosis,
      treatmentPlan,
      labResults,
      imagingStudies,
      referrals,
      followUp,
      doctorNotes,
      attachments,
      billing,
      status = 'completed',
      confidentialityLevel = 'normal'
    } = body

    // Validate required fields
    if (!patientId || !doctorId || !recordType) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: patientId, doctorId, recordType",
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

    // Validate doctor exists
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

    // Generate new record ID
    const recordId = `record-${Date.now()}`
    const now = new Date().toISOString()

    // Create comprehensive medical record
    const newRecord = {
      _id: recordId,
      patientId,
      doctorId,
      appointmentId,
      recordDate: new Date().toISOString(),
      recordType,

      // Clinical Information
      chiefComplaint: chiefComplaint || "",
      historyOfPresentIllness: historyOfPresentIllness || "",
      reviewOfSystems: reviewOfSystems || {},
      physicalExamination: physicalExamination || {},

      // Vital Signs
      vitalSigns: {
        bloodPressure: vitalSigns?.bloodPressure || { systolic: 0, diastolic: 0 },
        heartRate: vitalSigns?.heartRate || 0,
        temperature: vitalSigns?.temperature || 0,
        respiratoryRate: vitalSigns?.respiratoryRate || 0,
        oxygenSaturation: vitalSigns?.oxygenSaturation || 0,
        weight: vitalSigns?.weight || 0,
        height: vitalSigns?.height || 0,
        bmi: vitalSigns?.bmi || 0,
        painScale: vitalSigns?.painScale || 0
      },

      // Diagnosis
      diagnosis: {
        primary: diagnosis?.primary || {
          condition: "",
          icdCode: "",
          severity: "mild",
          onset: now,
          status: "active"
        },
        secondary: diagnosis?.secondary || [],
        differential: diagnosis?.differential || []
      },

      // Treatment Plan
      treatmentPlan: {
        medications: treatmentPlan?.medications || [],
        procedures: treatmentPlan?.procedures || [],
        therapies: treatmentPlan?.therapies || []
      },

      // Lab Results and Imaging
      labResults: labResults || [],
      imagingStudies: imagingStudies || [],
      referrals: referrals || [],

      // Follow-up
      followUp: {
        required: followUp?.required || false,
        timeframe: followUp?.timeframe || "",
        type: followUp?.type || "office",
        instructions: followUp?.instructions || "",
        scheduledDate: followUp?.scheduledDate || null
      },

      // Doctor Notes
      doctorNotes: {
        assessment: doctorNotes?.assessment || "",
        plan: doctorNotes?.plan || "",
        patientEducation: doctorNotes?.patientEducation || "",
        warningsSigns: doctorNotes?.warningsSigns || "",
        additionalNotes: doctorNotes?.additionalNotes || ""
      },

      // Attachments and Billing
      attachments: attachments || [],
      billing: {
        encounterType: billing?.encounterType || "",
        cptCodes: billing?.cptCodes || [],
        icdCodes: billing?.icdCodes || [],
        modifiers: billing?.modifiers || [],
        levelOfService: billing?.levelOfService || "1"
      },

      // Record Management
      status,
      isArchived: false,
      confidentialityLevel,

      // Audit Trail
      amendments: [],
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: "",

      // Timestamps
      createdAt: now,
      updatedAt: now,
      createdBy: user.userId || user.id,
      lastModifiedBy: user.userId || user.id
    }

    // Store the record
    mockMedicalRecords.set(recordId, newRecord)

    // Return created record with populated data
    const enrichedRecord = {
      ...newRecord,
      patient: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        matricNumber: patient.matricNumber
      },
      doctor: {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      }
    }

    return NextResponse.json({
      success: true,
      message: "Medical record created successfully",
      data: {
        medicalRecord: enrichedRecord
      }
    }, { status: 201 })

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
