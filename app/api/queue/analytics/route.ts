import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock analytics data generator
const generateQueueAnalytics = (period: string, doctorId?: string) => {
  const baseData = {
    overview: {
      totalPatients: 45,
      completedConsultations: 38,
      averageWaitTime: 22.5,
      averageConsultationTime: 28.3,
      patientSatisfactionRate: 94.2
    },
    queueMetrics: {
      peakHours: ["10:00", "14:00", "16:00"],
      busyDays: ["Monday", "Wednesday", "Friday"],
      averageQueueLength: 8.5,
      maxQueueLength: 15
    },
    doctorPerformance: [
      {
        doctorId: "550e8400-e29b-41d4-a716-446655440003",
        doctorName: "Dr. Jane Smith",
        patientsHandled: 12,
        averageConsultationTime: 25,
        efficiency: 92.3
      },
      {
        doctorId: "661f0622-f4bd-53f6-c938-668877662222",
        doctorName: "Dr. Michael Johnson",
        patientsHandled: 8,
        averageConsultationTime: 30,
        efficiency: 88.7
      },
      {
        doctorId: "772i2844-i9gi-08k1-h48d-11dd22117777",
        doctorName: "Dr. Sarah Wilson",
        patientsHandled: 15,
        averageConsultationTime: 22,
        efficiency: 95.1
      },
      {
        doctorId: "994k5177-k2jk-e1n4-k71g-eeffaaaa9999",
        doctorName: "Dr. Emily Brown",
        patientsHandled: 7,
        averageConsultationTime: 35,
        efficiency: 85.4
      }
    ]
  }

  // Adjust data based on period
  if (period === '7d') {
    baseData.overview.totalPatients = 315
    baseData.overview.completedConsultations = 294
  } else if (period === '30d') {
    baseData.overview.totalPatients = 1350
    baseData.overview.completedConsultations = 1260
  }

  // Filter by doctor if specified
  if (doctorId) {
    baseData.doctorPerformance = baseData.doctorPerformance.filter(
      doctor => doctor.doctorId === doctorId
    )
  }

  return baseData
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
    const period = searchParams.get('period') || '24h'
    const doctorId = searchParams.get('doctorId')

    // Validate period
    const validPeriods = ['1h', '24h', '7d', '30d']
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { success: false, message: 'Invalid period. Must be: 1h, 24h, 7d, or 30d' },
        { status: 400 }
      )
    }

    // Generate analytics data
    const analytics = generateQueueAnalytics(period, doctorId)

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
