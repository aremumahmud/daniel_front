import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mock notifications storage (in real implementation, this would be a database)
const mockNotifications = new Map([
  ["bb2c3d4e-5f6g-7890-bcde-f23456789012", {
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
    readAt: null
  }],
  ["cc3d4e5f-6g7h-8901-cdef-345678901234", {
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
    readAt: "2024-01-10T13:46:00Z"
  }]
])

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
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

    const { notificationId } = params

    // Find the notification
    const notification = mockNotifications.get(notificationId)
    
    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found",
          error: "NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Check if the notification belongs to this doctor
    if (notification.doctorId !== user.doctorId) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied to this notification",
          error: "FORBIDDEN"
        },
        { status: 403 }
      )
    }

    // Mark as read
    const readAt = new Date().toISOString()
    notification.isRead = true
    notification.readAt = readAt
    
    // Update in storage (in real implementation, update database)
    mockNotifications.set(notificationId, notification)

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      data: {
        notificationId: notificationId,
        isRead: true,
        readAt: readAt
      }
    })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark notification as read",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
