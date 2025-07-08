import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue data for demonstration
const generateQueueStatus = () => {
  const now = new Date()

  return {
    queue: [
      {
        "_id": "550e8400-e29b-41d4-a716-446655440000",
        "patientId": "550e8400-e29b-41d4-a716-446655440001",
        "patientName": "John Doe",
        "position": 1,
        "priority": "high",
        "status": "waiting",
        "reason": "Regular checkup",
        "symptoms": "Mild headache and fatigue",
        "queuedAt": new Date(now.getTime() - 30 * 60000).toISOString(),
        "estimatedWaitTime": 15,
        "assignedDoctorId": null,
        "assignedAt": null
      },
      {
        "_id": "550e8400-e29b-41d4-a716-446655440002",
        "patientId": "550e8400-e29b-41d4-a716-446655440003",
        "patientName": "Jane Smith",
        "position": 2,
        "priority": "medium",
        "status": "waiting",
        "reason": "Follow-up consultation",
        "symptoms": "Back pain",
        "queuedAt": new Date(now.getTime() - 20 * 60000).toISOString(),
        "estimatedWaitTime": 30,
        "assignedDoctorId": null,
        "assignedAt": null
      }
    ],
    doctorCapacities: [
      {
        "doctorId": "550e8400-e29b-41d4-a716-446655440004",
        "doctorName": "Dr. Jane Smith",
        "specialization": "General Medicine",
        "isOnline": true,
        "isAvailable": true,
        "currentPatients": 2,
        "maxPatients": 5,
        "averageConsultationTime": 20
      },
      {
        "doctorId": "550e8400-e29b-41d4-a716-446655440005",
        "doctorName": "Dr. Michael Brown",
        "specialization": "Cardiology",
        "isOnline": true,
        "isAvailable": false,
        "currentPatients": 3,
        "maxPatients": 4,
        "averageConsultationTime": 25
      }
    ],
    stats: {
      "totalWaiting": 8,
      "totalInConsultation": 3,
      "totalDoctors": 4,
      "availableDoctors": 2,
      "averageWaitTime": 18.5
    }
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

    // Check if user has appropriate role (Admin or Doctor)
    if (!['admin', 'doctor'].includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin or Doctor role required.' },
        { status: 403 }
      )
    }

    // Generate current queue status
    const queueStatus = generateQueueStatus()

    return NextResponse.json({
      success: true,
      data: queueStatus
    })

  } catch (error) {
    console.error('Error getting queue status:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get queue status. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
