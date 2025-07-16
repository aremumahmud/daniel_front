import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctor status storage
const mockDoctorStatus = new Map()
const mockDoctors = new Map()

// Initialize mock doctors (using real doctor ID structure)
mockDoctors.set("63c7fbca-214f-4220-8d42-571037cdc6af", {
  _id: "63c7fbca-214f-4220-8d42-571037cdc6af",
  userId: {
    _id: "74120179-b065-4f2a-a8c7-d6475cc3bb60",
    firstName: "Mahmud",
    lastName: "AremuMahmud",
    fullName: "Dr. Mahmud AremuMahmud",
    email: "aremumahmud20031@gmail.com"
  },
  specialization: "Orthopedics",
  licenseNumber: "5467i8o9p22",
  experience: 2,
  consultationFee: 34,
  isAvailable: true
})

// Initialize default doctor status
mockDoctorStatus.set("63c7fbca-214f-4220-8d42-571037cdc6af", {
  doctorId: "63c7fbca-214f-4220-8d42-571037cdc6af",
  isOnline: true,
  isAvailable: true,
  status: "available", // offline, online, available, busy, on-break
  breakType: null, // lunch, meeting, emergency, break
  breakDuration: null,
  breakStartTime: null,
  currentPatients: 5, // Based on your real API data
  maxPatients: 8, // Increased capacity
  averageConsultationTime: 25, // minutes
  workingHours: {
    start: "09:00",
    end: "17:00"
  },
  specializations: ["Orthopedics"], // Based on your real doctor data
  preferredPatientTypes: ["student", "staff"],
  lastActivity: new Date().toISOString(),
  shiftStartTime: new Date().toISOString(),
  shiftEndTime: null,
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    console.log('Decoded token:', decoded) // Debug log
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
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

    const doctorId = user.doctorId || user.userId || user.id || user._id || "63c7fbca-214f-4220-8d42-571037cdc6af"
    console.log('Using doctor ID:', doctorId) // Debug log

    // Get doctor status
    const doctorStatus = mockDoctorStatus.get(doctorId)
    if (!doctorStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor status not found",
          error: "STATUS_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Get doctor info
    const doctor = mockDoctors.get(doctorId)

    // Calculate utilization percentage
    const utilizationPercentage = (doctorStatus.currentPatients / doctorStatus.maxPatients) * 100

    // Determine availability status
    let availabilityStatus = "offline"
    if (doctorStatus.isOnline) {
      if (doctorStatus.status === "on-break") {
        availabilityStatus = "on-break"
      } else if (doctorStatus.currentPatients >= doctorStatus.maxPatients) {
        availabilityStatus = "at-capacity"
      } else if (doctorStatus.isAvailable) {
        availabilityStatus = "available"
      } else {
        availabilityStatus = "busy"
      }
    }

    const enrichedStatus = {
      ...doctorStatus,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        department: doctor.department
      } : null,
      capacity: {
        current: doctorStatus.currentPatients,
        maximum: doctorStatus.maxPatients,
        percentage: utilizationPercentage,
        availabilityStatus
      },
      isOnBreak: doctorStatus.status === "on-break",
      breakTimeRemaining: doctorStatus.breakStartTime && doctorStatus.breakDuration ? 
        Math.max(0, doctorStatus.breakDuration - Math.floor((Date.now() - new Date(doctorStatus.breakStartTime).getTime()) / (1000 * 60))) : 0
    }

    return NextResponse.json({
      success: true,
      data: enrichedStatus
    })

  } catch (error) {
    console.error('Error getting doctor status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get doctor status",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const user = extractUserFromToken(authHeader)
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

    const body = await request.json()
    const {
      isOnline,
      isAvailable,
      status,
      notes
    } = body

    const doctorId = user.doctorId || user.userId || user.id || user._id || "63c7fbca-214f-4220-8d42-571037cdc6af"
    console.log('Using doctor ID for update:', doctorId) // Debug log

    // Get existing status
    const existingStatus = mockDoctorStatus.get(doctorId)
    if (!existingStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor status not found",
          error: "STATUS_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    // Update status
    const updatedStatus = {
      ...existingStatus,
      isOnline: isOnline !== undefined ? isOnline : existingStatus.isOnline,
      isAvailable: isAvailable !== undefined ? isAvailable : existingStatus.isAvailable,
      status: status || existingStatus.status,
      notes: notes !== undefined ? notes : existingStatus.notes,
      lastActivity: now,
      updatedAt: now
    }

    // Handle shift timing
    if (isOnline === true && !existingStatus.isOnline) {
      updatedStatus.shiftStartTime = now
    } else if (isOnline === false && existingStatus.isOnline) {
      updatedStatus.shiftEndTime = now
      updatedStatus.isAvailable = false
      updatedStatus.status = "offline"
    }

    // Auto-set availability based on status
    if (status === "offline" || status === "on-break") {
      updatedStatus.isAvailable = false
    } else if (status === "available") {
      updatedStatus.isAvailable = true
    }

    // Store updated status
    mockDoctorStatus.set(doctorId, updatedStatus)

    // Get doctor info for response
    const doctor = mockDoctors.get(doctorId)
    const utilizationPercentage = (updatedStatus.currentPatients / updatedStatus.maxPatients) * 100

    let availabilityStatus = "offline"
    if (updatedStatus.isOnline) {
      if (updatedStatus.status === "on-break") {
        availabilityStatus = "on-break"
      } else if (updatedStatus.currentPatients >= updatedStatus.maxPatients) {
        availabilityStatus = "at-capacity"
      } else if (updatedStatus.isAvailable) {
        availabilityStatus = "available"
      } else {
        availabilityStatus = "busy"
      }
    }

    const responseData = {
      ...updatedStatus,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization
      } : null,
      capacity: {
        current: updatedStatus.currentPatients,
        maximum: updatedStatus.maxPatients,
        percentage: utilizationPercentage,
        availabilityStatus
      }
    }

    return NextResponse.json({
      success: true,
      message: "Doctor status updated successfully",
      data: responseData
    })

  } catch (error) {
    console.error('Error updating doctor status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update doctor status",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
