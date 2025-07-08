import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockPatients = new Map()
const mockMedicalRecords = new Map()
const mockAppointments = new Map()
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

// Initialize doctor-patient assignments
mockDoctorPatientAssignments.set("770g0622-g4bd-63f6-c938-668877662222", [
  "550e8400-e29b-41d4-a716-446655440000", // John Doe
  "660f9511-f3ac-52e5-b827-557766551111"  // Jane Smith
])

// Initialize mock medical records
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
  createdAt: "2024-01-15T10:00:00.000Z"
})

// Initialize mock appointments
mockAppointments.set("appt-001", {
  _id: "appt-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  appointmentDate: "2024-01-20T14:00:00.000Z",
  duration: 30,
  type: "follow-up",
  status: "scheduled",
  reason: "Follow-up on diabetes management",
  notes: "Check blood sugar levels",
  createdAt: "2024-01-15T10:00:00.000Z"
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

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
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

    const { patientId } = params

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Check if this patient is assigned to this doctor
    const assignedPatientIds = mockDoctorPatientAssignments.get(doctorId) || []
    if (!assignedPatientIds.includes(patientId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not assigned to this doctor",
          error: "FORBIDDEN"
        },
        { status: 403 }
      )
    }

    // Get patient details
    const patient = mockPatients.get(patientId)
    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found",
          error: "NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Get patient's medical records
    const medicalRecords = Array.from(mockMedicalRecords.values()).filter(
      (record: any) => record.patientId === patientId && record.doctorId === doctorId
    )

    // Get patient's appointments
    const appointments = Array.from(mockAppointments.values()).filter(
      (appointment: any) => appointment.patientId === patientId && appointment.doctorId === doctorId
    )

    // Sort records and appointments by date (newest first)
    medicalRecords.sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    appointments.sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())

    return NextResponse.json({
      success: true,
      data: {
        patient,
        medicalRecords,
        appointments,
        summary: {
          totalRecords: medicalRecords.length,
          totalAppointments: appointments.length,
          lastVisit: medicalRecords.length > 0 ? medicalRecords[0].visitDate : null,
          nextAppointment: appointments.find((appt: any) => 
            new Date(appt.appointmentDate) > new Date() && appt.status === 'scheduled'
          )?.appointmentDate || null
        }
      }
    })

  } catch (error) {
    console.error('Error getting patient details:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get patient details",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
