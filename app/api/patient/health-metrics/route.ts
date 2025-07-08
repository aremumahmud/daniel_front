import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock health metrics data for demonstration
const mockHealthMetrics = new Map()
const mockPatients = new Map()

// Initialize mock patient data
mockPatients.set("550e8400-e29b-41d4-a716-446655440001", {
  id: "550e8400-e29b-41d4-a716-446655440001",
  firstName: "John",
  lastName: "Doe"
})

// Initialize some mock health metrics
mockHealthMetrics.set("metric-001", {
  _id: "metric-001",
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
  tags: ["morning", "after_medication"]
})

mockHealthMetrics.set("metric-002", {
  _id: "metric-002",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "weight",
  value: 73.2,
  unit: "kg",
  notes: "Weekly weight check",
  recordedBy: "patient",
  recordedAt: "2024-01-14T08:00:00.000Z",
  status: "normal",
  tags: ["weekly", "morning"]
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      metricType,
      value,
      systolicValue,
      diastolicValue,
      unit,
      notes,
      recordedBy,
      deviceInfo,
      tags
    } = body

    // Validate required fields
    if (!metricType || !unit) {
      return NextResponse.json(
        { success: false, message: 'Metric type and unit are required' },
        { status: 400 }
      )
    }

    // Validate metric type
    const validMetricTypes = ["weight", "height", "blood_pressure", "heart_rate", "temperature", "blood_sugar", "cholesterol"]
    if (!validMetricTypes.includes(metricType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid metric type. Must be: weight, height, blood_pressure, heart_rate, temperature, blood_sugar, or cholesterol' },
        { status: 400 }
      )
    }

    // Validate blood pressure specific fields
    if (metricType === 'blood_pressure') {
      if (!systolicValue || !diastolicValue) {
        return NextResponse.json(
          { success: false, message: 'Systolic and diastolic values are required for blood pressure' },
          { status: 400 }
        )
      }
    } else {
      if (!value) {
        return NextResponse.json(
          { success: false, message: 'Value is required for this metric type' },
          { status: 400 }
        )
      }
    }

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      // For doctors/admins, they might be adding metrics for a specific patient
      patientId = body.patientId || patientId
    }

    // Check if patient exists
    const patient = mockPatients.get(patientId)
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      )
    }

    // Determine status based on metric type and values
    let status = "normal"
    if (metricType === 'blood_pressure') {
      if (systolicValue >= 140 || diastolicValue >= 90) {
        status = "high"
      } else if (systolicValue < 90 || diastolicValue < 60) {
        status = "low"
      }
    }

    // Create health metric entry
    const metricId = `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const healthMetric = {
      _id: metricId,
      patientId: patientId,
      metricType: metricType,
      ...(metricType === 'blood_pressure' ? { systolicValue, diastolicValue } : { value }),
      unit: unit,
      notes: notes || null,
      recordedBy: recordedBy || decoded.role,
      recordedAt: new Date().toISOString(),
      status: status,
      deviceInfo: deviceInfo || null,
      tags: tags || [],
      addedBy: decoded.userId
    }

    // Store health metric
    mockHealthMetrics.set(metricId, healthMetric)

    return NextResponse.json({
      success: true,
      message: "Health metric added successfully",
      data: healthMetric
    })

  } catch (error) {
    console.error('Error adding health metric:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add health metric. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
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

    // Check if user has appropriate role (Patient, Doctor, or Admin)
    if (!['patient', 'doctor', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Valid role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const metricType = searchParams.get('metricType')
    const period = searchParams.get('period')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const sortBy = searchParams.get('sortBy') || 'recordedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      patientId = searchParams.get('patientId') || patientId
    }

    // Filter metrics by patient
    let filteredMetrics = Array.from(mockHealthMetrics.values())
      .filter((metric: any) => metric.patientId === patientId)

    // Apply filters
    if (metricType) {
      filteredMetrics = filteredMetrics.filter((metric: any) => metric.metricType === metricType)
    }

    // Apply date filters
    if (period) {
      const now = new Date()
      let startDateFilter: Date
      
      switch (period) {
        case '7d':
          startDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case '1y':
          startDateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
      
      filteredMetrics = filteredMetrics.filter((metric: any) => 
        new Date(metric.recordedAt) >= startDateFilter
      )
    }

    if (startDate) {
      filteredMetrics = filteredMetrics.filter((metric: any) => 
        new Date(metric.recordedAt) >= new Date(startDate)
      )
    }

    if (endDate) {
      filteredMetrics = filteredMetrics.filter((metric: any) => 
        new Date(metric.recordedAt) <= new Date(endDate)
      )
    }

    // Sort metrics
    filteredMetrics.sort((a: any, b: any) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    // Calculate pagination
    const totalRecords = filteredMetrics.length
    const totalPages = Math.ceil(totalRecords / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMetrics = filteredMetrics.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        metrics: paginatedMetrics,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalRecords: totalRecords,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Error getting health metrics:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get health metrics. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
