import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue storage
const mockQueue = new Map()

// Initialize with some mock data
mockQueue.set("queue-001", {
  queueId: "queue-001",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  patientName: "John Doe",
  status: "waiting",
  priority: "medium",
  reason: "Regular checkup",
  queuedAt: "2024-01-15T10:00:00.000Z"
})

export async function DELETE(
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

    // Check if queue entry exists
    if (!mockQueue.has(queueId)) {
      return NextResponse.json(
        { success: false, message: 'Queue entry not found' },
        { status: 404 }
      )
    }

    // Get reason from request body (optional)
    let reason = "Patient removed from queue"
    try {
      const body = await request.json()
      if (body.reason) {
        reason = body.reason
      }
    } catch (error) {
      // Body is optional for DELETE requests
    }

    // Remove from queue
    mockQueue.delete(queueId)

    console.log(`Queue entry ${queueId} removed. Reason: ${reason}`)

    return NextResponse.json({
      success: true,
      message: "Patient removed from queue successfully"
    })

  } catch (error) {
    console.error('Error removing patient from queue:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove patient from queue. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
