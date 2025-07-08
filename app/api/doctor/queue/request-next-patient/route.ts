import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mock data for demonstration - in real implementation, this would connect to a database
const mockQueue = [
  {
    id: "660f9511-f3ac-52e5-b827-557766551111",
    name: "Jane Smith",
    queueNumber: "Q001",
    status: "waiting",
    priority: "normal",
    assignedAt: new Date().toISOString()
  },
  {
    id: "771h1733-h8fh-97j0-g37c-00cc11006666", 
    name: "Michael Johnson",
    queueNumber: "Q002",
    status: "waiting",
    priority: "normal",
    assignedAt: new Date().toISOString()
  }
]

const mockNotifications: any[] = []

// Helper function to extract JWT token and user info
function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  // In a real implementation, you would verify and decode the JWT token
  // For now, we'll mock a doctor user
  return {
    id: "770g0622-g4bd-63f6-c938-668877662222",
    role: "doctor",
    firstName: "John",
    lastName: "Doe",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222"
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json().catch(() => ({}))
    const { message, urgency = 'normal' } = body

    // Check if there are patients in queue for this doctor
    const nextPatient = mockQueue.find(patient => patient.status === 'waiting')
    
    if (!nextPatient) {
      return NextResponse.json({
        success: false,
        message: "No patients in queue at the moment.",
        error: "EMPTY_QUEUE"
      })
    }

    // Create notification for admin
    const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const notification = {
      _id: notificationId,
      type: 'DOCTOR_READY_FOR_NEXT_PATIENT',
      title: 'Doctor Ready for Next Patient',
      message: message || `Dr. ${user.lastName} is ready for the next patient`,
      isRead: false,
      priority: 5,
      urgency: urgency,
      createdAt: new Date().toISOString(),
      fromUserId: {
        firstName: user.firstName,
        lastName: user.lastName
      },
      doctorId: {
        userId: {
          firstName: user.firstName,
          lastName: user.lastName
        },
        specialization: "General Medicine"
      },
      patientId: {
        firstName: nextPatient.name.split(' ')[0],
        lastName: nextPatient.name.split(' ')[1] || ''
      },
      metadata: {
        queuePosition: 1,
        estimatedWaitTime: "5 minutes",
        nextPatientId: nextPatient.id,
        doctorName: `Dr. ${user.lastName}`,
        patientName: nextPatient.name,
        queueNumber: nextPatient.queueNumber
      },
      actions: [
        {
          label: "Call Patient",
          action: "call",
          data: {
            queueId: "880h1733-h5ce-74g7-d049-779988773333",
            patientId: nextPatient.id,
            doctorId: user.doctorId
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
    }

    // Store notification (in real implementation, save to database)
    mockNotifications.push(notification)

    // Update queue status (mark as called)
    const queueIndex = mockQueue.findIndex(p => p.id === nextPatient.id)
    if (queueIndex !== -1) {
      mockQueue[queueIndex].status = 'called'
    }

    // In a real implementation, emit WebSocket event to admin dashboard
    // io.to('admin-room').emit('doctor-ready-notification', { ... })

    return NextResponse.json({
      success: true,
      message: "Admin has been notified. Next patient will be called shortly.",
      data: {
        notificationId: notificationId,
        queuePosition: 1,
        estimatedWaitTime: "5 minutes",
        nextPatient: {
          id: nextPatient.id,
          name: nextPatient.name,
          queueNumber: nextPatient.queueNumber
        }
      }
    })

  } catch (error) {
    console.error('Error requesting next patient:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to notify admin. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
