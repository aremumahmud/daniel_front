import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctor capacity data for demonstration
const mockDoctorCapacity = new Map()

// Initialize some mock data
mockDoctorCapacity.set("550e8400-e29b-41d4-a716-446655440003", {
  _id: "550e8400-e29b-41d4-a716-446655440005",
  doctorId: "550e8400-e29b-41d4-a716-446655440003",
  isOnline: true,
  isAvailable: true,
  maxPatients: 8,
  currentPatients: 2,
  averageConsultationTime: 25,
  workingHours: {
    start: "09:00",
    end: "17:00"
  },
  availabilityStatus: "available",
  notes: null,
  lastUpdated: "2024-01-15T10:00:00.000Z"
})

export async function PUT(request: NextRequest) {
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

    // Check if user is a doctor
    if (decoded.role !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Doctor role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      isOnline,
      isAvailable,
      maxPatients,
      averageConsultationTime,
      workingHours,
      availabilityStatus,
      notes
    } = body

    // Validate availability status if provided
    if (availabilityStatus) {
      const validStatuses = ["available", "busy", "break", "offline"]
      if (!validStatuses.includes(availabilityStatus)) {
        return NextResponse.json(
          { success: false, message: 'Invalid availability status. Must be: available, busy, break, or offline' },
          { status: 400 }
        )
      }
    }

    // Validate working hours if provided
    if (workingHours) {
      if (!workingHours.start || !workingHours.end) {
        return NextResponse.json(
          { success: false, message: 'Working hours must include both start and end times' },
          { status: 400 }
        )
      }

      // Basic time format validation (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(workingHours.start) || !timeRegex.test(workingHours.end)) {
        return NextResponse.json(
          { success: false, message: 'Working hours must be in HH:MM format' },
          { status: 400 }
        )
      }
    }

    // Validate maxPatients if provided
    if (maxPatients !== undefined && (maxPatients < 1 || maxPatients > 20)) {
      return NextResponse.json(
        { success: false, message: 'Maximum patients must be between 1 and 20' },
        { status: 400 }
      )
    }

    // Validate averageConsultationTime if provided
    if (averageConsultationTime !== undefined && (averageConsultationTime < 5 || averageConsultationTime > 120)) {
      return NextResponse.json(
        { success: false, message: 'Average consultation time must be between 5 and 120 minutes' },
        { status: 400 }
      )
    }

    const doctorId = decoded.doctorId || "550e8400-e29b-41d4-a716-446655440003"
    
    // Get existing capacity data or create new
    let capacityData = mockDoctorCapacity.get(doctorId) || {
      _id: `capacity-${Date.now()}`,
      doctorId: doctorId,
      isOnline: true,
      isAvailable: true,
      maxPatients: 8,
      currentPatients: 0,
      averageConsultationTime: 30,
      workingHours: {
        start: "09:00",
        end: "17:00"
      },
      availabilityStatus: "available",
      notes: null
    }

    // Update capacity data with provided values
    if (isOnline !== undefined) {
      capacityData.isOnline = isOnline
      // If going offline, set availability to false
      if (!isOnline) {
        capacityData.isAvailable = false
        capacityData.availabilityStatus = "offline"
      }
    }

    if (isAvailable !== undefined && capacityData.isOnline) {
      capacityData.isAvailable = isAvailable
    }

    if (maxPatients !== undefined) {
      capacityData.maxPatients = maxPatients
      // If current patients exceed new max, adjust availability
      if (capacityData.currentPatients >= maxPatients) {
        capacityData.isAvailable = false
        capacityData.availabilityStatus = "busy"
      }
    }

    if (averageConsultationTime !== undefined) {
      capacityData.averageConsultationTime = averageConsultationTime
    }

    if (workingHours) {
      capacityData.workingHours = workingHours
    }

    if (availabilityStatus && capacityData.isOnline) {
      capacityData.availabilityStatus = availabilityStatus
      // Update isAvailable based on status
      capacityData.isAvailable = availabilityStatus === "available"
    }

    if (notes !== undefined) {
      capacityData.notes = notes
    }

    // Update timestamp
    capacityData.lastUpdated = new Date().toISOString()

    // Store updated capacity data
    mockDoctorCapacity.set(doctorId, capacityData)

    // In a real implementation, emit WebSocket events
    // io.emit('doctor_status_changed', {
    //   doctorId: doctorId,
    //   isOnline: capacityData.isOnline,
    //   isAvailable: capacityData.isAvailable,
    //   availabilityStatus: capacityData.availabilityStatus,
    //   maxPatients: capacityData.maxPatients,
    //   currentPatients: capacityData.currentPatients
    // })

    return NextResponse.json({
      success: true,
      message: "Doctor capacity updated successfully",
      data: capacityData
    })

  } catch (error) {
    console.error('Error updating doctor capacity:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update doctor capacity. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
