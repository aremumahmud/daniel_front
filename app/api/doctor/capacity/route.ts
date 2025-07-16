import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctor status storage (shared with other doctor APIs)
const mockDoctorStatus = new Map()
const mockDoctors = new Map()

// Initialize mock data
mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  firstName: "Dr. John",
  lastName: "Smith",
  specialization: "Cardiology",
  department: "Cardiology"
})

mockDoctorStatus.set("770g0622-g4bd-63f6-c938-668877662222", {
  doctorId: "770g0622-g4bd-63f6-c938-668877662222",
  isOnline: true,
  isAvailable: true,
  status: "available",
  currentPatients: 2,
  maxPatients: 5,
  averageConsultationTime: 20,
  workingHours: {
    start: "08:00",
    end: "17:00"
  },
  specializations: ["general", "cardiology"],
  preferredPatientTypes: ["student", "staff"],
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
          message: "Doctor capacity settings not found",
          error: "CAPACITY_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Get doctor info
    const doctor = mockDoctors.get(doctorId)

    // Calculate capacity metrics
    const utilizationPercentage = (doctorStatus.currentPatients / doctorStatus.maxPatients) * 100
    const remainingCapacity = doctorStatus.maxPatients - doctorStatus.currentPatients

    // Calculate estimated time for new patients
    const estimatedWaitTime = doctorStatus.currentPatients * doctorStatus.averageConsultationTime

    // Determine availability status
    let availabilityStatus = "available"
    if (doctorStatus.currentPatients >= doctorStatus.maxPatients) {
      availabilityStatus = "at-capacity"
    } else if (utilizationPercentage >= 80) {
      availabilityStatus = "near-capacity"
    }

    const capacityData = {
      doctorId,
      doctor: doctor ? {
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        department: doctor.department
      } : null,
      capacity: {
        current: doctorStatus.currentPatients,
        maximum: doctorStatus.maxPatients,
        remaining: remainingCapacity,
        percentage: Math.round(utilizationPercentage * 100) / 100
      },
      settings: {
        maxPatients: doctorStatus.maxPatients,
        averageConsultationTime: doctorStatus.averageConsultationTime,
        workingHours: doctorStatus.workingHours,
        specializations: doctorStatus.specializations,
        preferredPatientTypes: doctorStatus.preferredPatientTypes
      },
      metrics: {
        utilizationPercentage,
        availabilityStatus,
        estimatedWaitTime,
        patientsPerHour: Math.round(60 / doctorStatus.averageConsultationTime * 100) / 100,
        dailyCapacity: Math.floor((9 * 60) / doctorStatus.averageConsultationTime) // Assuming 9-hour workday
      },
      recommendations: []
    }

    // Add capacity recommendations
    if (utilizationPercentage > 90) {
      capacityData.recommendations.push({
        type: "warning",
        message: "You are at very high capacity. Consider taking a break or adjusting your schedule.",
        action: "reduce_capacity"
      })
    } else if (utilizationPercentage < 30) {
      capacityData.recommendations.push({
        type: "info",
        message: "You have low utilization. You can accept more patients.",
        action: "increase_availability"
      })
    }

    if (doctorStatus.averageConsultationTime > 30) {
      capacityData.recommendations.push({
        type: "suggestion",
        message: "Your average consultation time is high. Consider optimizing your workflow.",
        action: "optimize_workflow"
      })
    }

    return NextResponse.json({
      success: true,
      data: capacityData
    })

  } catch (error) {
    console.error('Error getting doctor capacity:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get doctor capacity",
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
      maxPatients,
      averageConsultationTime,
      workingHours,
      specializations,
      preferredPatientTypes
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

    // Validate capacity settings
    if (maxPatients !== undefined) {
      if (maxPatients < 1 || maxPatients > 20) {
        return NextResponse.json(
          {
            success: false,
            message: "Maximum patients must be between 1 and 20",
            error: "VALIDATION_ERROR"
          },
          { status: 400 }
        )
      }

      // Check if reducing capacity below current patient count
      if (maxPatients < existingStatus.currentPatients) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot reduce capacity below current patient count (${existingStatus.currentPatients})`,
            error: "CAPACITY_CONFLICT"
          },
          { status: 400 }
        )
      }
    }

    if (averageConsultationTime !== undefined) {
      if (averageConsultationTime < 5 || averageConsultationTime > 120) {
        return NextResponse.json(
          {
            success: false,
            message: "Average consultation time must be between 5 and 120 minutes",
            error: "VALIDATION_ERROR"
          },
          { status: 400 }
        )
      }
    }

    // Validate working hours
    if (workingHours) {
      const { start, end } = workingHours
      if (start && end) {
        const startTime = new Date(`2000-01-01T${start}:00`)
        const endTime = new Date(`2000-01-01T${end}:00`)
        
        if (startTime >= endTime) {
          return NextResponse.json(
            {
              success: false,
              message: "End time must be after start time",
              error: "VALIDATION_ERROR"
            },
            { status: 400 }
          )
        }
      }
    }

    const now = new Date().toISOString()

    // Update capacity settings
    const updatedStatus = {
      ...existingStatus,
      maxPatients: maxPatients !== undefined ? maxPatients : existingStatus.maxPatients,
      averageConsultationTime: averageConsultationTime !== undefined ? averageConsultationTime : existingStatus.averageConsultationTime,
      workingHours: workingHours ? { ...existingStatus.workingHours, ...workingHours } : existingStatus.workingHours,
      specializations: specializations !== undefined ? specializations : existingStatus.specializations,
      preferredPatientTypes: preferredPatientTypes !== undefined ? preferredPatientTypes : existingStatus.preferredPatientTypes,
      lastActivity: now,
      updatedAt: now
    }

    // Store updated status
    mockDoctorStatus.set(doctorId, updatedStatus)

    // Calculate new metrics
    const utilizationPercentage = (updatedStatus.currentPatients / updatedStatus.maxPatients) * 100
    const remainingCapacity = updatedStatus.maxPatients - updatedStatus.currentPatients

    let availabilityStatus = "available"
    if (updatedStatus.currentPatients >= updatedStatus.maxPatients) {
      availabilityStatus = "at-capacity"
    } else if (utilizationPercentage >= 80) {
      availabilityStatus = "near-capacity"
    }

    const responseData = {
      doctorId,
      capacity: {
        current: updatedStatus.currentPatients,
        maximum: updatedStatus.maxPatients,
        remaining: remainingCapacity,
        percentage: Math.round(utilizationPercentage * 100) / 100
      },
      settings: {
        maxPatients: updatedStatus.maxPatients,
        averageConsultationTime: updatedStatus.averageConsultationTime,
        workingHours: updatedStatus.workingHours,
        specializations: updatedStatus.specializations,
        preferredPatientTypes: updatedStatus.preferredPatientTypes
      },
      metrics: {
        utilizationPercentage,
        availabilityStatus,
        patientsPerHour: Math.round(60 / updatedStatus.averageConsultationTime * 100) / 100,
        dailyCapacity: Math.floor((9 * 60) / updatedStatus.averageConsultationTime)
      },
      updatedAt: now
    }

    return NextResponse.json({
      success: true,
      message: "Capacity settings updated successfully",
      data: responseData
    })

  } catch (error) {
    console.error('Error updating doctor capacity:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update doctor capacity",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
