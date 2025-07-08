import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for patient summary (aggregated from other endpoints)
const mockPatients = new Map()
const mockHealthMetrics = new Map()
const mockMedicalRecords = new Map()
const mockAppointments = new Map()
const mockDocuments = new Map()
const mockCommunications = new Map()

// Initialize mock patient data
mockPatients.set("550e8400-e29b-41d4-a716-446655440001", {
  _id: "550e8400-e29b-41d4-a716-446655440001",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1990-01-01",
  age: 34,
  gender: "male",
  contactInfo: {
    phoneMain: "+1234567890",
    email: "john.doe@example.com"
  },
  primaryDoctorId: "550e8400-e29b-41d4-a716-446655440003",
  primaryDoctorName: "Dr. Jane Smith"
})

// Initialize some sample data for summary calculations
// Health metrics
mockHealthMetrics.set("metric-001", {
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "weight",
  value: 73.2,
  recordedAt: "2024-01-15T08:30:00.000Z"
})

mockHealthMetrics.set("metric-002", {
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "blood_pressure",
  systolicValue: 120,
  diastolicValue: 80,
  recordedAt: "2024-01-15T08:30:00.000Z"
})

// Medical records
for (let i = 1; i <= 48; i++) {
  mockMedicalRecords.set(`record-${i}`, {
    patientId: "550e8400-e29b-41d4-a716-446655440001",
    recordType: "consultation",
    recordDate: new Date(2024, 0, Math.floor(Math.random() * 15) + 1).toISOString()
  })
}

// Appointments
for (let i = 1; i <= 25; i++) {
  const status = i <= 22 ? "completed" : (i <= 24 ? "cancelled" : "scheduled")
  mockAppointments.set(`appt-${i}`, {
    patientId: "550e8400-e29b-41d4-a716-446655440001",
    status: status,
    appointmentDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0]
  })
}

// Documents
for (let i = 1; i <= 15; i++) {
  mockDocuments.set(`doc-${i}`, {
    patientId: "550e8400-e29b-41d4-a716-446655440001",
    documentType: ["lab_result", "prescription", "insurance", "medical_image", "report"][Math.floor(Math.random() * 5)],
    isActive: true
  })
}

// Communications
for (let i = 1; i <= 28; i++) {
  mockCommunications.set(`comm-${i}`, {
    senderId: "550e8400-e29b-41d4-a716-446655440001",
    recipientId: "550e8400-e29b-41d4-a716-446655440003",
    sentAt: new Date(2024, 0, Math.floor(Math.random() * 15) + 1).toISOString()
  })
}

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
    const includeMetrics = searchParams.get('includeMetrics') === 'true'
    const includeRecords = searchParams.get('includeRecords') === 'true'
    const includeAppointments = searchParams.get('includeAppointments') === 'true'
    const period = searchParams.get('period') || '90d'

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      patientId = searchParams.get('patientId') || patientId
    }

    // Get patient information
    const patient = mockPatients.get(patientId)
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      )
    }

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }

    // Calculate statistics
    const totalAppointments = Array.from(mockAppointments.values())
      .filter((appt: any) => appt.patientId === patientId).length
    
    const completedAppointments = Array.from(mockAppointments.values())
      .filter((appt: any) => appt.patientId === patientId && appt.status === 'completed').length
    
    const totalHealthMetrics = Array.from(mockHealthMetrics.values())
      .filter((metric: any) => metric.patientId === patientId).length
    
    const totalDocuments = Array.from(mockDocuments.values())
      .filter((doc: any) => doc.patientId === patientId && doc.isActive).length
    
    const totalCommunications = Array.from(mockCommunications.values())
      .filter((comm: any) => comm.senderId === patientId || comm.recipientId === patientId).length

    // Generate recent activity
    const recentActivity = [
      {
        type: "appointment",
        description: "Completed consultation with Dr. Jane Smith",
        date: "2024-01-15T10:00:00.000Z"
      },
      {
        type: "health_metric",
        description: "Added blood pressure reading: 120/80",
        date: "2024-01-15T08:30:00.000Z"
      },
      {
        type: "document",
        description: "Uploaded lab results document",
        date: "2024-01-14T11:00:00.000Z"
      },
      {
        type: "communication",
        description: "Sent message to Dr. Jane Smith about medication",
        date: "2024-01-13T14:30:00.000Z"
      }
    ]

    // Health metrics summary (if requested)
    let healthMetricsSummary = {}
    if (includeMetrics) {
      healthMetricsSummary = {
        weight: {
          current: 73.2,
          trend: "stable",
          lastUpdated: "2024-01-15T08:30:00.000Z"
        },
        bloodPressure: {
          current: "120/80",
          status: "normal",
          lastUpdated: "2024-01-15T08:30:00.000Z"
        }
      }
    }

    // Upcoming appointments
    const upcomingAppointments = [
      {
        _id: "550e8400-e29b-41d4-a716-446655440008",
        doctorName: "Dr. Jane Smith",
        appointmentDate: "2024-01-22",
        appointmentTime: "10:00",
        type: "follow-up"
      }
    ]

    // Health alerts and reminders
    const alerts = [
      {
        type: "medication_reminder",
        message: "Time to take your daily vitamin D3",
        priority: "low"
      },
      {
        type: "appointment_reminder",
        message: "Upcoming appointment with Dr. Jane Smith on Jan 22",
        priority: "medium"
      }
    ]

    // Build response data
    const summaryData = {
      patient: patient,
      statistics: {
        totalAppointments: totalAppointments,
        completedAppointments: completedAppointments,
        totalHealthMetrics: totalHealthMetrics,
        totalDocuments: totalDocuments,
        totalCommunications: totalCommunications,
        lastVisit: "2024-01-15T10:00:00.000Z"
      },
      recentActivity: recentActivity,
      upcomingAppointments: upcomingAppointments,
      alerts: alerts
    }

    // Add optional sections based on query parameters
    if (includeMetrics) {
      summaryData['healthMetricsSummary'] = healthMetricsSummary
    }

    if (includeRecords) {
      summaryData['recentRecords'] = [
        {
          _id: "550e8400-e29b-41d4-a716-446655440002",
          recordType: "consultation",
          recordDate: "2024-01-15T10:00:00.000Z",
          doctorName: "Dr. Jane Smith",
          diagnosis: "General health checkup"
        }
      ]
    }

    if (includeAppointments) {
      summaryData['appointmentHistory'] = [
        {
          _id: "550e8400-e29b-41d4-a716-446655440004",
          doctorName: "Dr. Jane Smith",
          appointmentDate: "2024-01-15",
          status: "completed",
          type: "consultation"
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: summaryData
    })

  } catch (error) {
    console.error('Error getting patient summary:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get patient summary. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
