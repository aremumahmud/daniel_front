import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctor status storage
const mockDoctorStatuses = new Map()

// Initialize with some mock data
mockDoctorStatuses.set("550e8400-e29b-41d4-a716-446655440003", {
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  isOnline: true,
  isAvailable: true,
  updatedAt: "2024-01-15T10:45:00.000Z"
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
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

    const { doctorId } = params
    const body = await request.json()

    // Validate request body
    if (typeof body.isOnline !== 'undefined' && typeof body.isOnline !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isOnline must be a boolean' },
        { status: 400 }
      )
    }

    if (typeof body.isAvailable !== 'undefined' && typeof body.isAvailable !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isAvailable must be a boolean' },
        { status: 400 }
      )
    }

    // Get current status or create new one
    const currentStatus = mockDoctorStatuses.get(doctorId) || {
      doctorId,
      isOnline: false,
      isAvailable: false,
      updatedAt: new Date().toISOString()
    }

    // Update status
    const updatedStatus = {
      ...currentStatus,
      ...(typeof body.isOnline !== 'undefined' && { isOnline: body.isOnline }),
      ...(typeof body.isAvailable !== 'undefined' && { isAvailable: body.isAvailable }),
      updatedAt: new Date().toISOString()
    }

    // Store updated status
    mockDoctorStatuses.set(doctorId, updatedStatus)

    return NextResponse.json({
      success: true,
      message: "Doctor status updated successfully",
      data: updatedStatus
    })

  } catch (error) {
    console.error('Error updating doctor status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update doctor status. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
