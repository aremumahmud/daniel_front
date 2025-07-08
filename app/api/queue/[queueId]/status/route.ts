import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockQueue = new Map()
const mockDoctors = new Map()

// Initialize mock data
mockDoctors.set("550e8400-e29b-41d4-a716-446655440003", {
  id: "550e8400-e29b-41d4-a716-446655440003",
  name: "Dr. Jane Smith",
  currentPatients: 3,
  maxPatients: 8,
  isAvailable: true
})

mockQueue.set("550e8400-e29b-41d4-a716-446655440002", {
  _id: "550e8400-e29b-41d4-a716-446655440002",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  priority: "medium",
  status: "in_progress",
  queuedAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
  assignedAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
  type: "walk-in"
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { queueId: string } }
) {
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

    // Check if user has appropriate role (Admin or Doctor)
    if (!['admin', 'doctor'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or Doctor role required.' },
        { status: 403 }
      )
    }

    const { queueId } = params
    const body = await request.json()
    const { status, notes, completionNotes } = body

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ["waiting", "in_progress", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be: waiting, in_progress, completed, or cancelled' },
        { status: 400 }
      )
    }

    // Check if queue entry exists
    const queueEntry = mockQueue.get(queueId)
    if (!queueEntry) {
      return NextResponse.json(
        { success: false, message: 'Queue entry not found' },
        { status: 404 }
      )
    }

    // Calculate timing information
    const now = new Date()
    const queuedTime = new Date(queueEntry.queuedAt)
    const assignedTime = queueEntry.assignedAt ? new Date(queueEntry.assignedAt) : null

    let actualWaitTime = 0
    let consultationDuration = 0

    if (assignedTime) {
      actualWaitTime = Math.round((assignedTime.getTime() - queuedTime.getTime()) / (1000 * 60)) // minutes
    }

    if (status === 'completed' && assignedTime) {
      consultationDuration = Math.round((now.getTime() - assignedTime.getTime()) / (1000 * 60)) // minutes
    }

    // Update queue entry
    const previousStatus = queueEntry.status
    queueEntry.status = status
    queueEntry.updatedAt = now.toISOString()
    queueEntry.updatedBy = decoded.userId

    if (notes) {
      queueEntry.statusNotes = notes
    }

    if (status === 'completed') {
      queueEntry.completedAt = now.toISOString()
      queueEntry.actualWaitTime = actualWaitTime
      queueEntry.consultationDuration = consultationDuration
      
      if (completionNotes) {
        queueEntry.completionNotes = completionNotes
      }

      // Update doctor availability if consultation completed
      if (queueEntry.doctorId) {
        const doctor = mockDoctors.get(queueEntry.doctorId)
        if (doctor) {
          doctor.currentPatients = Math.max(0, doctor.currentPatients - 1)
          if (doctor.currentPatients < doctor.maxPatients) {
            doctor.isAvailable = true
          }
        }
      }
    }

    if (status === 'cancelled') {
      queueEntry.cancelledAt = now.toISOString()
      
      // Update doctor availability if consultation cancelled
      if (queueEntry.doctorId && previousStatus === 'in_progress') {
        const doctor = mockDoctors.get(queueEntry.doctorId)
        if (doctor) {
          doctor.currentPatients = Math.max(0, doctor.currentPatients - 1)
          if (doctor.currentPatients < doctor.maxPatients) {
            doctor.isAvailable = true
          }
        }
      }
    }

    // In a real implementation, emit WebSocket events
    // io.emit('queue_updated', {
    //   action: 'status_updated',
    //   queueId: queueId,
    //   previousStatus: previousStatus,
    //   newStatus: status,
    //   queueEntry: queueEntry
    // })

    // Prepare response data
    const responseData = {
      _id: queueEntry._id,
      status: queueEntry.status,
      updatedAt: queueEntry.updatedAt,
      notes: queueEntry.statusNotes || null,
      actualWaitTime: queueEntry.actualWaitTime || null,
      consultationDuration: queueEntry.consultationDuration || null
    }

    if (status === 'completed') {
      responseData.completedAt = queueEntry.completedAt
      responseData.completionNotes = queueEntry.completionNotes || null
    }

    if (status === 'cancelled') {
      responseData.cancelledAt = queueEntry.cancelledAt
    }

    return NextResponse.json({
      success: true,
      message: "Queue status updated successfully",
      data: responseData
    })

  } catch (error) {
    console.error('Error updating queue status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update queue status. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
