import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock communications data for demonstration
const mockCommunications = new Map()
const mockUsers = new Map()

// Initialize mock users
mockUsers.set("550e8400-e29b-41d4-a716-446655440001", {
  id: "550e8400-e29b-41d4-a716-446655440001",
  firstName: "John",
  lastName: "Doe",
  role: "patient"
})

mockUsers.set("550e8400-e29b-41d4-a716-446655440003", {
  id: "550e8400-e29b-41d4-a716-446655440003",
  firstName: "Dr. Jane",
  lastName: "Smith",
  role: "doctor"
})

// Initialize some mock communications
mockCommunications.set("550e8400-e29b-41d4-a716-446655440006", {
  _id: "550e8400-e29b-41d4-a716-446655440006",
  senderId: "550e8400-e29b-41d4-a716-446655440001",
  recipientId: "550e8400-e29b-41d4-a716-446655440003",
  senderName: "John Doe",
  recipientName: "Dr. Jane Smith",
  subject: "Question about medication side effects",
  message: "I've been experiencing mild dizziness since starting the new medication. Is this normal?",
  priority: "medium",
  type: "message",
  sentAt: "2024-01-15T12:00:00.000Z",
  status: "read",
  threadId: "550e8400-e29b-41d4-a716-446655440007",
  relatedTo: {
    entityType: "appointment",
    entityId: "550e8400-e29b-41d4-a716-446655440004"
  },
  hasAttachments: true,
  responseCount: 1,
  attachments: [
    {
      fileName: "symptom_log.pdf",
      fileUrl: "https://storage.example.com/attachments/symptom_log.pdf",
      fileSize: 512000
    }
  ]
})

mockCommunications.set("comm-002", {
  _id: "comm-002",
  senderId: "550e8400-e29b-41d4-a716-446655440003",
  recipientId: "550e8400-e29b-41d4-a716-446655440001",
  senderName: "Dr. Jane Smith",
  recipientName: "John Doe",
  subject: "Re: Question about medication side effects",
  message: "Mild dizziness can be a common side effect when starting this medication. It usually subsides within a few days. Please monitor and let me know if it persists or worsens.",
  priority: "medium",
  type: "message",
  sentAt: "2024-01-15T14:30:00.000Z",
  status: "read",
  threadId: "550e8400-e29b-41d4-a716-446655440007",
  relatedTo: {
    entityType: "appointment",
    entityId: "550e8400-e29b-41d4-a716-446655440004"
  },
  hasAttachments: false,
  responseCount: 0,
  isResponse: true,
  originalMessageId: "550e8400-e29b-41d4-a716-446655440006"
})

mockCommunications.set("comm-003", {
  _id: "comm-003",
  senderId: "550e8400-e29b-41d4-a716-446655440001",
  recipientId: "550e8400-e29b-41d4-a716-446655440003",
  senderName: "John Doe",
  recipientName: "Dr. Jane Smith",
  subject: "Appointment rescheduling request",
  message: "I need to reschedule my upcoming appointment due to a work conflict. Are there any available slots next week?",
  priority: "low",
  type: "question",
  sentAt: "2024-01-16T09:00:00.000Z",
  status: "unread",
  threadId: "thread-002",
  hasAttachments: false,
  responseCount: 0
})

export async function POST(request: NextRequest) {
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

    // Check if user has Patient role (only patients can send messages via this endpoint)
    if (decoded.role !== 'patient') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Only patients can send messages via this endpoint.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      recipientId,
      subject,
      message,
      priority,
      type,
      relatedTo,
      attachments
    } = body

    // Validate required fields
    if (!recipientId || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Recipient ID, subject, and message are required' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent"]
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, message: 'Invalid priority. Must be: low, medium, high, or urgent' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ["message", "question", "concern", "feedback"]
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid type. Must be: message, question, concern, or feedback' },
        { status: 400 }
      )
    }

    // Check if recipient exists and is a doctor
    const recipient = mockUsers.get(recipientId)
    if (!recipient) {
      return NextResponse.json(
        { success: false, message: 'Recipient not found' },
        { status: 404 }
      )
    }

    if (recipient.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Messages can only be sent to doctors' },
        { status: 400 }
      )
    }

    // Get sender information
    const senderId = decoded.userId || "550e8400-e29b-41d4-a716-446655440001"
    const sender = mockUsers.get(senderId) || {
      firstName: "John",
      lastName: "Doe"
    }

    // Generate thread ID (in real system, this would be based on existing conversation or new)
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create communication entry
    const communicationId = `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const communication = {
      _id: communicationId,
      senderId: senderId,
      recipientId: recipientId,
      senderName: `${sender.firstName} ${sender.lastName}`,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      subject: subject,
      message: message,
      priority: priority || "medium",
      type: type || "message",
      sentAt: new Date().toISOString(),
      status: "sent",
      threadId: threadId,
      relatedTo: relatedTo || null,
      hasAttachments: attachments && attachments.length > 0,
      responseCount: 0,
      attachments: attachments || []
    }

    // Store communication
    mockCommunications.set(communicationId, communication)

    // In a real system, you would:
    // 1. Send notification to the recipient doctor
    // 2. Store attachments in secure storage
    // 3. Update conversation thread
    // 4. Log the communication for audit purposes

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: {
        _id: communicationId,
        senderId: senderId,
        recipientId: recipientId,
        subject: subject,
        message: message,
        priority: priority || "medium",
        type: type || "message",
        sentAt: communication.sentAt,
        status: "sent",
        threadId: threadId,
        relatedTo: relatedTo || null
      }
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
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

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const threadId = searchParams.get('threadId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    const userId = decoded.userId || "550e8400-e29b-41d4-a716-446655440001"

    // Filter communications where user is sender or recipient
    let filteredCommunications = Array.from(mockCommunications.values())
      .filter((communication: any) => 
        communication.senderId === userId || communication.recipientId === userId
      )

    // Apply filters
    if (type) {
      filteredCommunications = filteredCommunications.filter((communication: any) => communication.type === type)
    }

    if (status) {
      filteredCommunications = filteredCommunications.filter((communication: any) => communication.status === status)
    }

    if (priority) {
      filteredCommunications = filteredCommunications.filter((communication: any) => communication.priority === priority)
    }

    if (threadId) {
      filteredCommunications = filteredCommunications.filter((communication: any) => communication.threadId === threadId)
    }

    // Sort communications by sent date (most recent first)
    filteredCommunications.sort((a: any, b: any) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )

    // Calculate pagination
    const totalRecords = filteredCommunications.length
    const totalPages = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCommunications = filteredCommunications.slice(startIndex, endIndex)

    // Calculate summary statistics
    const totalMessages = filteredCommunications.length
    const unreadMessages = filteredCommunications.filter((comm: any) => 
      comm.recipientId === userId && comm.status === 'unread'
    ).length
    const urgentMessages = filteredCommunications.filter((comm: any) => 
      comm.priority === 'urgent' && comm.recipientId === userId && comm.status === 'unread'
    ).length

    return NextResponse.json({
      success: true,
      data: {
        communications: paginatedCommunications,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalRecords: totalRecords
        },
        summary: {
          totalMessages: totalMessages,
          unreadMessages: unreadMessages,
          urgentMessages: urgentMessages
        }
      }
    })

  } catch (error) {
    console.error('Error getting communications:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get communications. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
