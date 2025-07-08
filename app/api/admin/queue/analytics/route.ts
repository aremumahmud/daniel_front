import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock analytics data for demonstration
const generateMockAnalytics = (startDate?: string, endDate?: string, doctorId?: string) => {
  const now = new Date()
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
  const end = endDate ? new Date(endDate) : now

  return {
    currentQueue: {
      waiting: 12,
      assigned: 8,
      inConsultation: 5,
      total: 25
    },
    performance: {
      totalAssignments: 156,
      totalCompletions: 148,
      completionRate: "94.87",
      avgProcessingTime: 125, // seconds
      avgWaitTime: 18 // minutes
    },
    resources: {
      availableDoctors: 3,
      avgWaitTime: 18
    },
    eventAnalytics: [
      {
        _id: {
          eventType: "CONSULTATION_COMPLETED",
          hour: 14
        },
        count: 12,
        avgProcessingTime: 1850
      },
      {
        _id: {
          eventType: "PATIENT_ASSIGNED",
          hour: 14
        },
        count: 15,
        avgProcessingTime: 45
      },
      {
        _id: {
          eventType: "CONSULTATION_STARTED",
          hour: 13
        },
        count: 18,
        avgProcessingTime: 120
      },
      {
        _id: {
          eventType: "CONSULTATION_COMPLETED",
          hour: 13
        },
        count: 16,
        avgProcessingTime: 1920
      },
      {
        _id: {
          eventType: "PATIENT_ASSIGNED",
          hour: 13
        },
        count: 20,
        avgProcessingTime: 38
      }
    ],
    hourlyStats: [
      { hour: 9, assignments: 8, completions: 6, avgWaitTime: 15 },
      { hour: 10, assignments: 12, completions: 10, avgWaitTime: 18 },
      { hour: 11, assignments: 15, completions: 14, avgWaitTime: 22 },
      { hour: 12, assignments: 10, completions: 12, avgWaitTime: 16 },
      { hour: 13, assignments: 20, completions: 16, avgWaitTime: 25 },
      { hour: 14, assignments: 15, completions: 12, avgWaitTime: 20 },
      { hour: 15, assignments: 8, completions: 10, avgWaitTime: 14 }
    ],
    doctorPerformance: doctorId ? [
      {
        doctorId: doctorId,
        name: "Dr. John Doe",
        totalConsultations: 24,
        avgConsultationTime: 28,
        completionRate: "96.0",
        patientSatisfaction: 4.8
      }
    ] : [
      {
        doctorId: "770g0622-g4bd-63f6-c938-668877662222",
        name: "Dr. John Doe",
        totalConsultations: 24,
        avgConsultationTime: 28,
        completionRate: "96.0",
        patientSatisfaction: 4.8
      },
      {
        doctorId: "881i2844-i6df-85h8-e15a-88aa99884444",
        name: "Dr. Sarah Wilson",
        totalConsultations: 18,
        avgConsultationTime: 42,
        completionRate: "94.4",
        patientSatisfaction: 4.9
      },
      {
        doctorId: "992j4066-j7eg-96i9-f26b-99bb00995555",
        name: "Dr. Emily Brown",
        totalConsultations: 32,
        avgConsultationTime: 22,
        completionRate: "97.8",
        patientSatisfaction: 4.7
      }
    ],
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }
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

    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const doctorId = searchParams.get('doctorId')

    // Validate date parameters
    if (startDate && isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { success: false, message: 'Invalid start date format' },
        { status: 400 }
      )
    }

    if (endDate && isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { success: false, message: 'Invalid end date format' },
        { status: 400 }
      )
    }

    // Generate analytics data
    const analytics = generateMockAnalytics(startDate || undefined, endDate || undefined, doctorId || undefined)

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Error getting queue analytics:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get queue analytics. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
