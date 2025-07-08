import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue settings data
let queueSettings = {
  autoAssignment: {
    enabled: true,
    algorithm: "round_robin",
    considerSpecialization: true,
    maxWaitTime: 30
  },
  prioritySettings: {
    emergency: {
      maxWaitTime: 5,
      autoEscalate: true
    },
    high: {
      maxWaitTime: 15,
      autoEscalate: true
    },
    medium: {
      maxWaitTime: 30,
      autoEscalate: false
    },
    low: {
      maxWaitTime: 60,
      autoEscalate: false
    }
  },
  notifications: {
    enabled: true,
    channels: ["websocket", "email"],
    adminAlerts: true,
    doctorAlerts: true
  },
  workingHours: {
    start: "08:00",
    end: "18:00",
    timezone: "UTC"
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

    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: queueSettings
    })

  } catch (error) {
    console.error('Error getting queue settings:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get queue settings. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

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

    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      autoAssignment,
      prioritySettings,
      notifications,
      workingHours
    } = body

    // Validate working hours if provided
    if (workingHours) {
      if (!workingHours.start || !workingHours.end) {
        return NextResponse.json(
          { success: false, message: 'Working hours must include both start and end times' },
          { status: 400 }
        )
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(workingHours.start) || !timeRegex.test(workingHours.end)) {
        return NextResponse.json(
          { success: false, message: 'Working hours must be in HH:MM format' },
          { status: 400 }
        )
      }
    }

    // Validate auto assignment settings if provided
    if (autoAssignment) {
      if (autoAssignment.maxWaitTime !== undefined && (autoAssignment.maxWaitTime < 5 || autoAssignment.maxWaitTime > 120)) {
        return NextResponse.json(
          { success: false, message: 'Auto assignment max wait time must be between 5 and 120 minutes' },
          { status: 400 }
        )
      }
    }

    // Validate priority settings if provided
    if (prioritySettings) {
      const validPriorities = ['emergency', 'high', 'medium', 'low']
      for (const [priority, settings] of Object.entries(prioritySettings)) {
        if (!validPriorities.includes(priority)) {
          return NextResponse.json(
            { success: false, message: `Invalid priority level: ${priority}` },
            { status: 400 }
          )
        }
        if (settings.maxWaitTime !== undefined && (settings.maxWaitTime < 1 || settings.maxWaitTime > 240)) {
          return NextResponse.json(
            { success: false, message: `Priority ${priority} max wait time must be between 1 and 240 minutes` },
            { status: 400 }
          )
        }
      }
    }

    // Update settings with provided values
    if (autoAssignment) {
      queueSettings.autoAssignment = { ...queueSettings.autoAssignment, ...autoAssignment }
    }

    if (prioritySettings) {
      queueSettings.prioritySettings = { ...queueSettings.prioritySettings, ...prioritySettings }
    }

    if (notifications) {
      queueSettings.notifications = { ...queueSettings.notifications, ...notifications }
    }

    if (workingHours) {
      queueSettings.workingHours = { ...queueSettings.workingHours, ...workingHours }
    }

    return NextResponse.json({
      success: true,
      message: "Queue settings updated successfully",
      data: {
        updatedAt: new Date().toISOString(),
        updatedBy: decoded.email || "admin@example.com"
      }
    })

  } catch (error) {
    console.error('Error updating queue settings:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update queue settings. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
