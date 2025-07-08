import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockConsultations = [
  {
    _id: "550e8400-e29b-41d4-a716-446655440000",
    status: "completed",
    startTime: "2024-01-10T14:30:00Z",
    endTime: "2024-01-10T14:55:00Z",
    duration: 25,
    patient: {
      _id: "660f9511-f3ac-52e5-b827-557766551111",
      firstName: "Jane",
      lastName: "Smith"
    },
    queue: {
      queueNumber: "Q001",
      priority: "normal"
    },
    consultationFee: 150.00,
    diagnosis: ["Upper Respiratory Infection"]
  },
  {
    _id: "661f0622-f4bd-53f6-c938-668877662222",
    status: "completed",
    startTime: "2024-01-10T10:00:00Z",
    endTime: "2024-01-10T10:30:00Z",
    duration: 30,
    patient: {
      _id: "771h1733-h8fh-97j0-g37c-00cc11006666",
      firstName: "Michael",
      lastName: "Johnson"
    },
    queue: {
      queueNumber: "Q002",
      priority: "high"
    },
    consultationFee: 200.00,
    diagnosis: ["Hypertension"]
  },
  {
    _id: "772i2844-i9gi-08k1-h48d-11dd22117777",
    status: "completed",
    startTime: "2024-01-09T16:15:00Z",
    endTime: "2024-01-09T16:45:00Z",
    duration: 30,
    patient: {
      _id: "883j3955-j0hj-19l2-i59e-22ee33228888",
      firstName: "Sarah",
      lastName: "Wilson"
    },
    queue: {
      queueNumber: "Q003",
      priority: "normal"
    },
    consultationFee: 175.00,
    diagnosis: ["Diabetes Type 2"]
  }
]

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

    // Check if user is a doctor
    if (decoded.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const patientId = searchParams.get('patientId')

    // Filter consultations based on query parameters
    let filteredConsultations = [...mockConsultations]

    if (status) {
      filteredConsultations = filteredConsultations.filter(c => c.status === status)
    }

    if (patientId) {
      filteredConsultations = filteredConsultations.filter(c => c.patient._id === patientId)
    }

    if (startDate) {
      const start = new Date(startDate)
      filteredConsultations = filteredConsultations.filter(c => new Date(c.startTime) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      filteredConsultations = filteredConsultations.filter(c => new Date(c.startTime) <= end)
    }

    // Sort by start time (most recent first)
    filteredConsultations.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    // Pagination
    const total = filteredConsultations.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedConsultations = filteredConsultations.slice(offset, offset + limit)

    // Calculate summary statistics
    const totalRevenue = filteredConsultations.reduce((sum, c) => sum + (c.consultationFee || 0), 0)
    const avgDuration = filteredConsultations.length > 0 
      ? filteredConsultations.reduce((sum, c) => sum + c.duration, 0) / filteredConsultations.length 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        consultations: paginatedConsultations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary: {
          totalConsultations: total,
          totalRevenue: totalRevenue,
          averageDuration: Math.round(avgDuration),
          completedConsultations: filteredConsultations.filter(c => c.status === 'completed').length
        }
      }
    })

  } catch (error) {
    console.error('Error getting consultation history:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get consultation history. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
