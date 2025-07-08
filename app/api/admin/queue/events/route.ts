import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock events data for demonstration
const mockEvents = [
  {
    _id: "990j3955-j7eg-96i9-f26b-99bb00995555",
    eventType: "CONSULTATION_COMPLETED",
    timestamp: "2024-01-10T14:55:00Z",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    doctorName: "Dr. John Doe",
    patientId: "660f9511-f3ac-52e5-b827-557766551111",
    patientName: "Jane Smith",
    description: "Consultation completed and automatic assignment processed",
    metadata: {
      processingTime: 1250,
      consultationDuration: 25,
      nextAssignment: {
        patientId: "771h1733-h8fh-97j0-g37c-00cc11006666",
        patientName: "Michael Johnson",
        doctorId: "770g0622-g4bd-63f6-c938-668877662222"
      }
    },
    source: "system",
    status: "success",
    priority: "normal"
  },
  {
    _id: "aa1k4066-k8fh-a7j0-g37c-aaccbbcc6666",
    eventType: "PATIENT_ASSIGNED",
    timestamp: "2024-01-10T14:56:00Z",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    doctorName: "Dr. John Doe",
    patientId: "771h1733-h8fh-97j0-g37c-00cc11006666",
    patientName: "Michael Johnson",
    description: "Patient automatically assigned to available doctor",
    metadata: {
      processingTime: 45,
      queuePosition: 1,
      estimatedWaitTime: 5,
      assignmentType: "automatic"
    },
    source: "system",
    status: "success",
    priority: "normal"
  },
  {
    _id: "bb2l5177-l9gi-b8k1-h48d-bbddeeee7777",
    eventType: "CONSULTATION_STARTED",
    timestamp: "2024-01-10T14:30:00Z",
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    doctorName: "Dr. John Doe",
    patientId: "660f9511-f3ac-52e5-b827-557766551111",
    patientName: "Jane Smith",
    description: "Consultation session started",
    metadata: {
      processingTime: 120,
      estimatedDuration: 30,
      consultationRoom: "Room 3"
    },
    source: "doctor",
    status: "success",
    priority: "normal"
  },
  {
    _id: "cc3m6288-m0hj-c9l2-i59e-cceeffffaaaa",
    eventType: "PATIENT_MANUAL_ASSIGNMENT",
    timestamp: "2024-01-10T13:45:00Z",
    doctorId: "881i2844-i6df-85h8-e15a-88aa99884444",
    doctorName: "Dr. Sarah Wilson",
    patientId: "883j3955-j0hj-19l2-i59e-22ee33228888",
    patientName: "Sarah Wilson",
    description: "Patient manually assigned by admin",
    metadata: {
      processingTime: 30,
      assignedBy: "admin-001",
      reason: "Patient requested specific doctor",
      priority: "high"
    },
    source: "admin",
    status: "success",
    priority: "high"
  },
  {
    _id: "dd4n7399-n1ik-d0m3-j60f-ddffffff8888",
    eventType: "CONSULTATION_CANCELLED",
    timestamp: "2024-01-10T13:20:00Z",
    doctorId: "992j4066-j7eg-96i9-f26b-99bb00995555",
    doctorName: "Dr. Emily Brown",
    patientId: "994k5177-k2jk-e1n4-k71g-eeffaaaa9999",
    patientName: "Robert Davis",
    description: "Consultation cancelled due to patient no-show",
    metadata: {
      processingTime: 60,
      cancellationReason: "Patient did not show up",
      cancelledBy: "doctor"
    },
    source: "doctor",
    status: "cancelled",
    priority: "normal"
  },
  {
    _id: "ee5o8400-o2jl-e2o5-l82h-eeffaaaa0000",
    eventType: "DOCTOR_STATUS_CHANGED",
    timestamp: "2024-01-10T12:00:00Z",
    doctorId: "aa3k5177-k8fh-a7j0-g37c-aaccbbcc6666",
    doctorName: "Dr. Robert Davis",
    patientId: null,
    patientName: null,
    description: "Doctor status changed from offline to available",
    metadata: {
      processingTime: 15,
      previousStatus: "offline",
      newStatus: "available",
      changedBy: "doctor"
    },
    source: "doctor",
    status: "success",
    priority: "low"
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

    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const eventType = searchParams.get('eventType')
    const doctorId = searchParams.get('doctorId')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Filter events based on query parameters
    let filteredEvents = [...mockEvents]

    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.eventType === eventType)
    }

    if (doctorId) {
      filteredEvents = filteredEvents.filter(event => event.doctorId === doctorId)
    }

    if (priority) {
      filteredEvents = filteredEvents.filter(event => event.priority === priority)
    }

    if (source) {
      filteredEvents = filteredEvents.filter(event => event.source === source)
    }

    // Sort by timestamp (most recent first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply limit
    const limitedEvents = filteredEvents.slice(0, limit)

    // Calculate event type summary
    const eventTypeSummary = filteredEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: {
        events: limitedEvents,
        total: filteredEvents.length,
        summary: {
          totalEvents: filteredEvents.length,
          eventTypes: eventTypeSummary,
          timeRange: {
            latest: filteredEvents.length > 0 ? filteredEvents[0].timestamp : null,
            earliest: filteredEvents.length > 0 ? filteredEvents[filteredEvents.length - 1].timestamp : null
          }
        },
        filters: {
          eventType,
          doctorId,
          priority,
          source,
          limit
        }
      }
    })

  } catch (error) {
    console.error('Error getting queue events:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get queue events. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
