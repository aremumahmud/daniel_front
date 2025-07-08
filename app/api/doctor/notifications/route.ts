import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mock notifications data
const mockNotifications = [
  {
    _id: "bb2c3d4e-5f6g-7890-bcde-f23456789012",
    type: "PATIENT_ASSIGNED",
    title: "New Patient Assigned",
    message: "New patient Jane Smith has been assigned to you",
    isRead: false,
    priority: 5,
    urgency: "normal",
    createdAt: "2024-01-10T14:25:00Z",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    patientId: "660f9511-f3ac-52e5-b827-557766551111",
    queueId: "880h1733-h5ce-74g7-d049-779988773333",
    metadata: {
      queueNumber: "Q001",
      patientAge: 39
    },
    actions: [
      {
        label: "View Patient",
        action: "view",
        url: "/doctor/patients/660f9511-f3ac-52e5-b827-557766551111"
      }
    ],
    fromUserId: null,
    patientId: {
      firstName: "Jane",
      lastName: "Smith"
    }
  },
  {
    _id: "cc3d4e5f-6g7h-8901-cdef-345678901234",
    type: "PATIENT_CALLED",
    title: "Patient Called",
    message: "Patient Michael Johnson is on the way to your consultation room",
    isRead: true,
    priority: 3,
    urgency: "normal",
    createdAt: "2024-01-10T13:45:00Z",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    patientId: "771h1733-h8fh-97j0-g37c-00cc11006666",
    queueId: "990i2844-i6df-85h8-e15a-88aa99884444",
    metadata: {
      queueNumber: "Q002",
      estimatedArrival: "2024-01-10T13:50:00Z"
    },
    actions: [
      {
        label: "View Patient",
        action: "view",
        url: "/doctor/patients/771h1733-h8fh-97j0-g37c-00cc11006666"
      }
    ],
    fromUserId: null,
    patientId: {
      firstName: "Michael",
      lastName: "Johnson"
    }
  },
  {
    _id: "dd4e5f6g-7h8i-9012-defg-456789012345",
    type: "CONSULTATION_REMINDER",
    title: "Consultation Reminder",
    message: "You have a consultation scheduled in 15 minutes",
    isRead: false,
    priority: 4,
    urgency: "normal",
    createdAt: "2024-01-10T14:15:00Z",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    patientId: "882j3955-j7eg-96i9-f26b-99bb00995555",
    metadata: {
      consultationTime: "2024-01-10T14:30:00Z",
      consultationType: "follow-up"
    },
    actions: [
      {
        label: "View Schedule",
        action: "view",
        url: "/doctor/schedule"
      }
    ],
    fromUserId: null,
    patientId: {
      firstName: "Sarah",
      lastName: "Wilson"
    }
  }
]

// Helper function to extract JWT token and user info
function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  // In a real implementation, you would verify and decode the JWT token
  return {
    id: "770g0622-g4bd-63f6-c938-668877662222",
    role: "doctor",
    firstName: "John",
    lastName: "Doe",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222"
  }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authorization)
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Filter notifications for this doctor
    let doctorNotifications = mockNotifications.filter(
      notification => notification.doctorId === user.doctorId
    )

    // Filter by unread if requested
    if (unreadOnly) {
      doctorNotifications = doctorNotifications.filter(
        notification => !notification.isRead
      )
    }

    // Calculate pagination
    const totalItems = doctorNotifications.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = doctorNotifications.slice(startIndex, endIndex)

    // Count unread notifications
    const unreadCount = mockNotifications.filter(
      notification => notification.doctorId === user.doctorId && !notification.isRead
    ).length

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit
        },
        unreadCount: unreadCount
      }
    })

  } catch (error) {
    console.error('Error getting doctor notifications:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get notifications",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
