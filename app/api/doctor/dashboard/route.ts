import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

    // Get the doctor's ID from the token
    const doctorId = user.userId || user.id

    // Mock dashboard data for the doctor
    const dashboardData = {
      summary: {
        totalPatients: 15,
        todayAppointments: 8,
        pendingConsultations: 3,
        completedToday: 5
      },
      recentPatients: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "John Doe",
          lastVisit: "2024-01-15T10:00:00.000Z",
          status: "active"
        },
        {
          id: "660f9511-f3ac-52e5-b827-557766551111",
          name: "Jane Smith",
          lastVisit: "2024-01-14T14:30:00.000Z",
          status: "active"
        }
      ],
      upcomingAppointments: [
        {
          id: "apt-001",
          patientName: "John Doe",
          time: "2024-01-16T09:00:00.000Z",
          type: "consultation"
        },
        {
          id: "apt-002",
          patientName: "Jane Smith",
          time: "2024-01-16T10:30:00.000Z",
          type: "follow-up"
        }
      ],
      notifications: [
        {
          id: "notif-001",
          message: "New patient assigned: John Doe",
          type: "info",
          timestamp: "2024-01-15T12:00:00.000Z",
          read: false
        }
      ]
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Doctor dashboard error:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
