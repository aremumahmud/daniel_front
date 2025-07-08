import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mock admin notifications data
const mockAdminNotifications = [
  {
    _id: "cc3d4e5f-6g7h-8901-cdef-345678901234",
    type: "DOCTOR_READY_FOR_NEXT_PATIENT",
    title: "Doctor Ready for Next Patient",
    message: "Dr. John Doe is ready for the next patient",
    isRead: false,
    priority: 5,
    urgency: "normal",
    createdAt: "2024-01-10T14:30:00Z",
    fromUserId: {
      firstName: "John",
      lastName: "Doe"
    },
    doctorId: {
      userId: {
        firstName: "John",
        lastName: "Doe"
      },
      specialization: "General Medicine"
    },
    patientId: {
      firstName: "Jane",
      lastName: "Smith"
    },
    metadata: {
      queuePosition: 1,
      estimatedWaitTime: "5 minutes",
      nextPatientId: "660f9511-f3ac-52e5-b827-557766551111",
      doctorName: "Dr. John Doe",
      patientName: "Jane Smith",
      queueNumber: "Q001"
    },
    actions: [
      {
        label: "Call Patient",
        action: "call",
        data: {
          queueId: "880h1733-h5ce-74g7-d049-779988773333",
          patientId: "660f9511-f3ac-52e5-b827-557766551111",
          doctorId: "770g0622-g4bd-63f6-c938-668877662222"
        },
        style: "primary"
      },
      {
        label: "View Queue",
        action: "view",
        url: "/admin/queue",
        style: "secondary"
      }
    ]
  },
  {
    _id: "dd4e5f6g-7h8i-9012-defg-456789012345",
    type: "PATIENT_NO_SHOW",
    title: "Patient No Show",
    message: "Patient Michael Johnson did not show up for consultation",
    isRead: true,
    priority: 3,
    urgency: "normal",
    createdAt: "2024-01-10T13:45:00Z",
    fromUserId: null,
    doctorId: {
      userId: {
        firstName: "Jane",
        lastName: "Smith"
      },
      specialization: "Cardiology"
    },
    patientId: {
      firstName: "Michael",
      lastName: "Johnson"
    },
    metadata: {
      scheduledTime: "2024-01-10T13:30:00Z",
      queueNumber: "Q002",
      doctorName: "Dr. Jane Smith",
      patientName: "Michael Johnson"
    },
    actions: [
      {
        label: "Reschedule",
        action: "reschedule",
        data: {
          patientId: "771h1733-h8fh-97j0-g37c-00cc11006666",
          doctorId: "881i4733-i8gh-74j0-g37d-11dd22117777"
        },
        style: "primary"
      },
      {
        label: "Remove from Queue",
        action: "remove",
        data: {
          queueId: "990i2844-i6df-85h8-e15a-88aa99884444"
        },
        style: "secondary"
      }
    ]
  },
  {
    _id: "ee5f6g7h-8i9j-0123-efgh-567890123456",
    type: "QUEUE_OVERFLOW_WARNING",
    title: "Queue Overflow Warning",
    message: "Queue is getting too long - 15 patients waiting",
    isRead: false,
    priority: 4,
    urgency: "high",
    createdAt: "2024-01-10T14:20:00Z",
    fromUserId: null,
    metadata: {
      queueLength: 15,
      averageWaitTime: "45 minutes",
      availableDoctors: 2,
      recommendedAction: "Add more doctors or extend hours"
    },
    actions: [
      {
        label: "View Queue",
        action: "view",
        url: "/admin/queue",
        style: "primary"
      },
      {
        label: "Call Additional Doctors",
        action: "call-doctors",
        style: "secondary"
      }
    ]
  }
]

// Helper function to extract JWT token and user info
function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  // In a real implementation, you would verify and decode the JWT token
  return {
    id: "admin_user_id",
    role: "admin",
    firstName: "Admin",
    lastName: "User"
  }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authorization)
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')

    // Filter notifications
    let filteredNotifications = [...mockAdminNotifications]

    // Filter by type if specified
    if (type) {
      filteredNotifications = filteredNotifications.filter(
        notification => notification.type === type
      )
    }

    // Filter by unread if requested
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(
        notification => !notification.isRead
      )
    }

    // Calculate pagination
    const totalItems = filteredNotifications.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex)

    // Count unread notifications
    const unreadCount = mockAdminNotifications.filter(
      notification => !notification.isRead
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
    console.error('Error getting admin notifications:', error)
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
