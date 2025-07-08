import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock health metrics data for analytics (shared with main health-metrics route)
const mockHealthMetrics = new Map()

// Initialize some mock health metrics for analytics
mockHealthMetrics.set("metric-001", {
  _id: "metric-001",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "weight",
  value: 73.2,
  unit: "kg",
  recordedAt: "2024-01-15T08:00:00.000Z",
  status: "normal"
})

mockHealthMetrics.set("metric-002", {
  _id: "metric-002",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "weight",
  value: 72.8,
  unit: "kg",
  recordedAt: "2024-01-08T08:00:00.000Z",
  status: "normal"
})

mockHealthMetrics.set("metric-003", {
  _id: "metric-003",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "weight",
  value: 71.5,
  unit: "kg",
  recordedAt: "2024-01-01T08:00:00.000Z",
  status: "normal"
})

mockHealthMetrics.set("metric-004", {
  _id: "metric-004",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "blood_pressure",
  systolicValue: 120,
  diastolicValue: 80,
  unit: "mmHg",
  recordedAt: "2024-01-15T10:30:00.000Z",
  status: "normal"
})

mockHealthMetrics.set("metric-005", {
  _id: "metric-005",
  patientId: "550e8400-e29b-41d4-a716-446655440001",
  metricType: "blood_pressure",
  systolicValue: 118,
  diastolicValue: 78,
  unit: "mmHg",
  recordedAt: "2024-01-10T10:30:00.000Z",
  status: "normal"
})

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
    const metricType = searchParams.get('metricType') || 'all'
    const period = searchParams.get('period') || '90d'
    const includeComparisons = searchParams.get('includeComparisons') === 'true'
    const groupBy = searchParams.get('groupBy') || 'week'

    // Determine patient ID based on role
    let patientId = decoded.patientId || "550e8400-e29b-41d4-a716-446655440001"
    if (decoded.role === 'doctor' || decoded.role === 'admin') {
      patientId = searchParams.get('patientId') || patientId
    }

    // Filter metrics by patient
    let filteredMetrics = Array.from(mockHealthMetrics.values())
      .filter((metric: any) => metric.patientId === patientId)

    // Apply date filter based on period
    const now = new Date()
    let startDateFilter: Date
    
    switch (period) {
      case '30d':
        startDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6m':
        startDateFilter = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    
    filteredMetrics = filteredMetrics.filter((metric: any) => 
      new Date(metric.recordedAt) >= startDateFilter
    )

    // Group metrics by type
    const metricsByType = new Map()
    filteredMetrics.forEach((metric: any) => {
      if (!metricsByType.has(metric.metricType)) {
        metricsByType.set(metric.metricType, [])
      }
      metricsByType.get(metric.metricType).push(metric)
    })

    // Calculate analytics for each metric type
    const analytics: any = {}
    const trends: any[] = []

    // Normal ranges for comparison
    const normalRanges = {
      weight: { min: 65, max: 80, unit: 'kg' },
      blood_pressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 }, unit: 'mmHg' },
      heart_rate: { min: 60, max: 100, unit: 'bpm' },
      temperature: { min: 36.1, max: 37.2, unit: '°C' },
      blood_sugar: { min: 70, max: 140, unit: 'mg/dL' },
      cholesterol: { min: 0, max: 200, unit: 'mg/dL' }
    }

    for (const [type, metrics] of metricsByType.entries()) {
      if (metricType !== 'all' && metricType !== type) continue

      const sortedMetrics = (metrics as any[]).sort((a, b) => 
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      )

      if (type === 'blood_pressure') {
        // Handle blood pressure separately
        const systolicValues = sortedMetrics.map((m: any) => m.systolicValue)
        const diastolicValues = sortedMetrics.map((m: any) => m.diastolicValue)
        
        const avgSystolic = systolicValues.reduce((a: number, b: number) => a + b, 0) / systolicValues.length
        const avgDiastolic = diastolicValues.reduce((a: number, b: number) => a + b, 0) / diastolicValues.length
        
        const lastReading = sortedMetrics[sortedMetrics.length - 1]
        const firstReading = sortedMetrics[0]
        
        // Calculate trend
        const systolicChange = lastReading.systolicValue - firstReading.systolicValue
        const diastolicChange = lastReading.diastolicValue - firstReading.diastolicValue
        let trend = 'stable'
        if (Math.abs(systolicChange) > 5 || Math.abs(diastolicChange) > 5) {
          trend = (systolicChange > 0 || diastolicChange > 0) ? 'increasing' : 'decreasing'
        }

        analytics[type] = {
          average: `${Math.round(avgSystolic)}/${Math.round(avgDiastolic)}`,
          systolicAverage: Math.round(avgSystolic),
          diastolicAverage: Math.round(avgDiastolic),
          min: `${Math.min(...systolicValues)}/${Math.min(...diastolicValues)}`,
          max: `${Math.max(...systolicValues)}/${Math.max(...diastolicValues)}`,
          trend: trend,
          changePercentage: Math.round(((systolicChange + diastolicChange) / 2) / ((firstReading.systolicValue + firstReading.diastolicValue) / 2) * 100 * 100) / 100,
          lastReading: {
            value: `${lastReading.systolicValue}/${lastReading.diastolicValue}`,
            date: lastReading.recordedAt
          }
        }

        if (includeComparisons && normalRanges[type]) {
          const range = normalRanges[type] as any
          const systolicStatus = lastReading.systolicValue >= range.systolic.min && lastReading.systolicValue <= range.systolic.max
          const diastolicStatus = lastReading.diastolicValue >= range.diastolic.min && lastReading.diastolicValue <= range.diastolic.max
          
          analytics[type].normalRange = {
            systolic: range.systolic,
            diastolic: range.diastolic,
            status: (systolicStatus && diastolicStatus) ? 'within_range' : 'outside_range'
          }
        }

        // Add to trends
        sortedMetrics.forEach((metric: any) => {
          trends.push({
            date: metric.recordedAt.split('T')[0],
            [type]: `${metric.systolicValue}/${metric.diastolicValue}`
          })
        })

      } else {
        // Handle single-value metrics
        const values = sortedMetrics.map((m: any) => m.value)
        const average = values.reduce((a: number, b: number) => a + b, 0) / values.length
        const min = Math.min(...values)
        const max = Math.max(...values)
        
        const lastReading = sortedMetrics[sortedMetrics.length - 1]
        const firstReading = sortedMetrics[0]
        
        // Calculate trend
        const change = lastReading.value - firstReading.value
        const changePercentage = (change / firstReading.value) * 100
        let trend = 'stable'
        if (Math.abs(changePercentage) > 2) {
          trend = change > 0 ? 'increasing' : 'decreasing'
        }

        analytics[type] = {
          average: Math.round(average * 100) / 100,
          min: min,
          max: max,
          trend: trend,
          changePercentage: Math.round(changePercentage * 100) / 100,
          lastReading: {
            value: lastReading.value,
            date: lastReading.recordedAt
          }
        }

        if (includeComparisons && normalRanges[type]) {
          const range = normalRanges[type] as any
          analytics[type].normalRange = {
            min: range.min,
            max: range.max,
            status: (lastReading.value >= range.min && lastReading.value <= range.max) ? 'within_range' : 'outside_range'
          }
        }

        // Add to trends
        sortedMetrics.forEach((metric: any) => {
          trends.push({
            date: metric.recordedAt.split('T')[0],
            [type]: metric.value
          })
        })
      }
    }

    // Generate insights
    const insights: string[] = []
    for (const [type, data] of Object.entries(analytics)) {
      const metricData = data as any
      if (metricData.trend === 'stable') {
        insights.push(`${type.replace('_', ' ')} has remained stable over the past ${period}`)
      } else if (metricData.trend === 'increasing') {
        insights.push(`${type.replace('_', ' ')} shows an increasing trend (${metricData.changePercentage}% change)`)
      } else if (metricData.trend === 'decreasing') {
        insights.push(`${type.replace('_', ' ')} shows a decreasing trend (${metricData.changePercentage}% change)`)
      }
      
      if (metricData.normalRange && metricData.normalRange.status === 'within_range') {
        insights.push(`All ${type.replace('_', ' ')} readings are within normal range`)
      } else if (metricData.normalRange && metricData.normalRange.status === 'outside_range') {
        insights.push(`Recent ${type.replace('_', ' ')} readings are outside normal range`)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        analytics: analytics,
        trends: trends,
        insights: insights
      }
    })

  } catch (error) {
    console.error('Error getting health metrics analytics:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get health metrics analytics. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
