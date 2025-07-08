import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock health metrics data for demonstration (shared with main health-metrics route)
const mockHealthMetrics = new Map()

// Initialize some mock health metrics
mockHealthMetrics.set("550e8400-e29b-41d4-a716-446655440000", {
  _id: "550e8400-e29b-41d4-a716-446655440000",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "weight",
  value: 73.2,
  unit: "kg",
  notes: "Weekly weight check",
  recordedBy: "patient",
  recordedAt: "2024-01-15T08:00:00.000Z",
  status: "normal",
  tags: ["weekly", "morning"],
  addedBy: "550e8400-e29b-41d4-a716-446655440001"
})

mockHealthMetrics.set("metric-bp-001", {
  _id: "metric-bp-001",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "blood_pressure",
  systolicValue: 120,
  diastolicValue: 80,
  unit: "mmHg",
  notes: "Normal reading after medication",
  recordedBy: "patient",
  recordedAt: "2024-01-15T10:30:00.000Z",
  status: "normal",
  deviceInfo: {
    deviceName: "Omron BP Monitor",
    deviceModel: "HEM-7120"
  },
  tags: ["morning", "after_medication"],
  addedBy: "550e8400-e29b-41d4-a716-446655440001"
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { metricId: string } }
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

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    const { metricId } = params
    const body = await request.json()

    // Find the health metric
    const existingMetric = mockHealthMetrics.get(metricId)
    if (!existingMetric) {
      return NextResponse.json(
        { success: false, message: 'Health metric not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update this metric
    const userPatientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'patient' && existingMetric.patientId !== userPatientId) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only update your own health metrics.' },
        { status: 403 }
      )
    }

    // Extract updatable fields from request body
    const {
      value,
      systolicValue,
      diastolicValue,
      notes,
      tags,
      deviceInfo
    } = body

    // Create updated metric object
    const updatedMetric = {
      ...existingMetric,
      updatedAt: new Date().toISOString(),
      updatedBy: decoded.userId
    }

    // Update fields if provided
    if (existingMetric.metricType === 'blood_pressure') {
      if (systolicValue !== undefined) {
        updatedMetric.systolicValue = systolicValue
      }
      if (diastolicValue !== undefined) {
        updatedMetric.diastolicValue = diastolicValue
      }
      
      // Recalculate status for blood pressure
      if (systolicValue !== undefined || diastolicValue !== undefined) {
        const systolic = systolicValue !== undefined ? systolicValue : existingMetric.systolicValue
        const diastolic = diastolicValue !== undefined ? diastolicValue : existingMetric.diastolicValue
        
        if (systolic >= 140 || diastolic >= 90) {
          updatedMetric.status = "high"
        } else if (systolic < 90 || diastolic < 60) {
          updatedMetric.status = "low"
        } else {
          updatedMetric.status = "normal"
        }
      }
    } else {
      if (value !== undefined) {
        updatedMetric.value = value
      }
    }

    if (notes !== undefined) {
      updatedMetric.notes = notes
    }

    if (tags !== undefined) {
      updatedMetric.tags = tags
    }

    if (deviceInfo !== undefined) {
      updatedMetric.deviceInfo = deviceInfo
    }

    // Store updated metric
    mockHealthMetrics.set(metricId, updatedMetric)

    // Return only the updated fields in response
    const responseData: any = {
      _id: metricId,
      updatedAt: updatedMetric.updatedAt
    }

    if (value !== undefined) responseData.value = value
    if (systolicValue !== undefined) responseData.systolicValue = systolicValue
    if (diastolicValue !== undefined) responseData.diastolicValue = diastolicValue
    if (notes !== undefined) responseData.notes = notes
    if (tags !== undefined) responseData.tags = tags
    if (deviceInfo !== undefined) responseData.deviceInfo = deviceInfo

    return NextResponse.json({
      success: true,
      message: "Health metric updated successfully",
      data: responseData
    })

  } catch (error) {
    console.error('Error updating health metric:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update health metric. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { metricId: string } }
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

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    const { metricId } = params

    // Find the health metric
    const existingMetric = mockHealthMetrics.get(metricId)
    if (!existingMetric) {
      return NextResponse.json(
        { success: false, message: 'Health metric not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete this metric
    const userPatientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'patient' && existingMetric.patientId !== userPatientId) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only delete your own health metrics.' },
        { status: 403 }
      )
    }

    // Delete the health metric
    mockHealthMetrics.delete(metricId)

    return NextResponse.json({
      success: true,
      message: "Health metric deleted successfully"
    })

  } catch (error) {
    console.error('Error deleting health metric:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete health metric. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
