import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue status storage
const mockQueueStatuses = new Map()

// Initialize with some mock data
mockQueueStatuses.set("queue-001", {
  queueId: "queue-001",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  status: "waiting",
  priority: "medium",
  notes: "",
  updatedAt: "2024-01-15T10:00:00.000Z"
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

    // Validate required fields
    if (!body.status) {
      return NextResponse.json(
        { success: false, message: 'status is required' },
        { status: 400 }
      )
    }

    // Validate status values
    const validStatuses = ['waiting', 'assigned', 'in-consultation', 'completed', 'cancelled']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Get current queue entry or create new one
    const currentEntry = mockQueueStatuses.get(queueId) || {
      queueId,
      patientId: "unknown",
      status: "waiting",
      priority: "medium",
      notes: "",
      updatedAt: new Date().toISOString()
    }

    // Update queue entry
    const updatedEntry = {
      ...currentEntry,
      status: body.status,
      ...(body.priority && { priority: body.priority }),
      ...(body.notes && { notes: body.notes }),
      updatedAt: new Date().toISOString()
    }

    // Store updated entry
    mockQueueStatuses.set(queueId, updatedEntry)

    return NextResponse.json({
      success: true,
      message: "Patient status updated successfully",
      data: {
        queueId,
        status: body.status,
        updatedAt: updatedEntry.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating patient status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update patient status. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
