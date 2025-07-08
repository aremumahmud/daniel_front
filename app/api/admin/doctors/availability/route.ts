import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockDoctors = [
  {
    doctorId: "770g0622-g4bd-63f6-c938-668877662222",
    name: "Dr. John Doe",
    specialization: "General Medicine",
    currentLoad: 0,
    maxCapacity: 5,
    averageConsultationTime: 30,
    status: "available",
    isOnline: true,
    workingHours: {
      start: "09:00",
      end: "17:00"
    },
    currentPatient: null,
    estimatedCompletionTime: null
  },
  {
    doctorId: "881i2844-i6df-85h8-e15a-88aa99884444",
    name: "Dr. Sarah Wilson",
    specialization: "Cardiology",
    currentLoad: 3,
    maxCapacity: 3,
    averageConsultationTime: 45,
    status: "busy",
    isOnline: true,
    workingHours: {
      start: "08:00",
      end: "16:00"
    },
    currentPatient: "Michael Johnson",
    estimatedCompletionTime: "2024-01-10T15:15:00Z"
  },
  {
    doctorId: "992j4066-j7eg-96i9-f26b-99bb00995555",
    name: "Dr. Emily Brown",
    specialization: "Pediatrics",
    currentLoad: 1,
    maxCapacity: 4,
    averageConsultationTime: 25,
    status: "available",
    isOnline: true,
    workingHours: {
      start: "10:00",
      end: "18:00"
    },
    currentPatient: null,
    estimatedCompletionTime: null
  },
  {
    doctorId: "aa3k5177-k8fh-a7j0-g37c-aaccbbcc6666",
    name: "Dr. Robert Davis",
    specialization: "Orthopedics",
    currentLoad: 2,
    maxCapacity: 4,
    averageConsultationTime: 40,
    status: "available",
    isOnline: true,
    workingHours: {
      start: "09:30",
      end: "17:30"
    },
    currentPatient: null,
    estimatedCompletionTime: null
  },
  {
    doctorId: "bb4l6288-l9gi-b8k1-h48d-bbddeeee7777",
    name: "Dr. Lisa Martinez",
    specialization: "Dermatology",
    currentLoad: 0,
    maxCapacity: 3,
    averageConsultationTime: 20,
    status: "offline",
    isOnline: false,
    workingHours: {
      start: "11:00",
      end: "19:00"
    },
    currentPatient: null,
    estimatedCompletionTime: null
  }
]

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

    // Categorize doctors by availability
    const availableDoctors = mockDoctors.filter(doctor => 
      doctor.status === "available" && doctor.isOnline
    )

    const busyDoctors = mockDoctors.filter(doctor => 
      doctor.status === "busy" && doctor.isOnline
    )

    const offlineDoctors = mockDoctors.filter(doctor => 
      !doctor.isOnline
    )

    // Calculate summary statistics
    const summary = {
      totalDoctors: mockDoctors.length,
      availableCount: availableDoctors.length,
      busyCount: busyDoctors.length,
      offlineCount: offlineDoctors.length
    }

    return NextResponse.json({
      success: true,
      data: {
        availableDoctors: availableDoctors.map(doctor => ({
          doctorId: doctor.doctorId,
          name: doctor.name,
          specialization: doctor.specialization,
          currentLoad: doctor.currentLoad,
          maxCapacity: doctor.maxCapacity,
          averageConsultationTime: doctor.averageConsultationTime,
          status: doctor.status,
          isOnline: doctor.isOnline,
          workingHours: doctor.workingHours
        })),
        busyDoctors: busyDoctors.map(doctor => ({
          doctorId: doctor.doctorId,
          name: doctor.name,
          specialization: doctor.specialization,
          currentLoad: doctor.currentLoad,
          maxCapacity: doctor.maxCapacity,
          status: doctor.status,
          currentPatient: doctor.currentPatient,
          estimatedCompletionTime: doctor.estimatedCompletionTime
        })),
        offlineDoctors: offlineDoctors.map(doctor => ({
          doctorId: doctor.doctorId,
          name: doctor.name,
          specialization: doctor.specialization,
          status: "offline",
          workingHours: doctor.workingHours
        })),
        summary
      }
    })

  } catch (error) {
    console.error('Error getting doctor availability:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get doctor availability. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
