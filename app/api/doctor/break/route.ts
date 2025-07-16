import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Import the same mock data from status route
const mockDoctorStatus = new Map()
const mockDoctors = new Map()

// Initialize mock data (same as status route)
mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Dr. John",
  lastName: "Smith",
  specialization: "Cardiology"
})

mockDoctorStatus.set("770g0622-g4bd-63f6-c938-668877662222", {
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  isOnline: true,
  isAvailable: true,
  status: "available",
  breakType: null,
  breakDuration: null,
  breakStartTime: null,
  currentPatients: 2,
  maxPatients: 5,
  lastActivity: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
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
      isOnBreak,
      breakType, // 'lunch', 'meeting', 'emergency', 'break'
      duration, // in minutes
      notes
    } = body

    const doctorId = user.userId || user.id

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

    if (isOnBreak) {
      // Starting a break
      if (!breakType) {
        return NextResponse.json(
          {
            success: false,
            message: "Break type is required when starting a break",
            error: "VALIDATION_ERROR"
          },
          { status: 400 }
        )
      }

      // Check if doctor has patients in consultation
      if (existingStatus.currentPatients > 0 && breakType !== 'emergency') {
        return NextResponse.json(
          {
            success: false,
            message: "Cannot take break while patients are assigned. Complete consultations first.",
            error: "PATIENTS_ASSIGNED"
          },
          { status: 400 }
        )
      }

      // Set default duration based on break type
      let breakDuration = duration
      if (!breakDuration) {
        switch (breakType) {
          case 'lunch':
            breakDuration = 60
            break
          case 'meeting':
            breakDuration = 30
            break
          case 'emergency':
            breakDuration = 15
            break
          default:
            breakDuration = 15
        }
      }

      const updatedStatus = {
        ...existingStatus,
        isAvailable: false,
        status: "on-break",
        breakType,
        breakDuration,
        breakStartTime: now,
        notes: notes || `On ${breakType} break`,
        lastActivity: now,
        updatedAt: now
      }

      mockDoctorStatus.set(doctorId, updatedStatus)

      // Calculate break end time
      const breakEndTime = new Date(Date.now() + breakDuration * 60000).toISOString()

      return NextResponse.json({
        success: true,
        message: `${breakType.charAt(0).toUpperCase() + breakType.slice(1)} break started successfully`,
        data: {
          doctorId,
          isOnBreak: true,
          breakType,
          breakDuration,
          breakStartTime: now,
          breakEndTime,
          status: "on-break",
          isAvailable: false
        }
      })

    } else {
      // Ending a break
      if (existingStatus.status !== "on-break") {
        return NextResponse.json(
          {
            success: false,
            message: "Doctor is not currently on break",
            error: "NOT_ON_BREAK"
          },
          { status: 400 }
        )
      }

      // Calculate actual break duration
      const actualBreakDuration = existingStatus.breakStartTime ? 
        Math.floor((Date.now() - new Date(existingStatus.breakStartTime).getTime()) / (1000 * 60)) : 0

      const updatedStatus = {
        ...existingStatus,
        isAvailable: true,
        status: "available",
        breakType: null,
        breakDuration: null,
        breakStartTime: null,
        notes: notes || "Returned from break",
        lastActivity: now,
        updatedAt: now
      }

      mockDoctorStatus.set(doctorId, updatedStatus)

      return NextResponse.json({
        success: true,
        message: "Break ended successfully. You are now available for patients.",
        data: {
          doctorId,
          isOnBreak: false,
          breakType: null,
          actualBreakDuration,
          status: "available",
          isAvailable: true,
          returnedAt: now
        }
      })
    }

  } catch (error) {
    console.error('Error managing break:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to manage break",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
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

    const doctorId = user.userId || user.id

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

    // Calculate break information
    let breakInfo = {
      isOnBreak: doctorStatus.status === "on-break",
      breakType: doctorStatus.breakType,
      breakDuration: doctorStatus.breakDuration,
      breakStartTime: doctorStatus.breakStartTime,
      breakTimeRemaining: 0,
      breakTimeElapsed: 0
    }

    if (breakInfo.isOnBreak && doctorStatus.breakStartTime) {
      const elapsed = Math.floor((Date.now() - new Date(doctorStatus.breakStartTime).getTime()) / (1000 * 60))
      breakInfo.breakTimeElapsed = elapsed
      breakInfo.breakTimeRemaining = Math.max(0, (doctorStatus.breakDuration || 0) - elapsed)
    }

    // Get break history (mock data)
    const breakHistory = [
      {
        date: new Date().toISOString().split('T')[0],
        breaks: [
          {
            type: "lunch",
            startTime: "12:00",
            endTime: "13:00",
            duration: 60
          }
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        current: breakInfo,
        history: breakHistory,
        breakTypes: [
          { id: 'lunch', label: 'Lunch Break', defaultDuration: 60, icon: '🍽️' },
          { id: 'meeting', label: 'Meeting', defaultDuration: 30, icon: '👥' },
          { id: 'emergency', label: 'Emergency', defaultDuration: 15, icon: '🚨' },
          { id: 'break', label: 'Short Break', defaultDuration: 15, icon: '☕' }
        ]
      }
    })

  } catch (error) {
    console.error('Error getting break information:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get break information",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
