import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock data for demonstration
const mockPatients = new Map()
const mockDoctors = new Map()
const mockAssignments = new Map()

// Initialize some mock data
mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  dateOfBirth: "1985-03-15",
  gender: "female",
  phone: "+1234567890",
  email: "jane.smith@email.com",
  status: "waiting"
})

mockPatients.set("771h1733-h8fh-97j0-g37c-00cc11006666", {
  id: "771h1733-h8fh-97j0-g37c-00cc11006666",
  firstName: "Michael",
  lastName: "Johnson",
  dateOfBirth: "1990-07-22",
  gender: "male",
  phone: "+1234567891",
  email: "michael.johnson@email.com",
  status: "waiting"
})

mockDoctors.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  name: "Dr. John Doe",
  specialization: "General Medicine",
  currentLoad: 0,
  maxCapacity: 5,
  status: "available",
  isOnline: true
})

mockDoctors.set("881i2844-i6df-85h8-e15a-88aa99884444", {
  id: "881i2844-i6df-85h8-e15a-88aa99884444",
  name: "Dr. Sarah Wilson",
  specialization: "Cardiology",
  currentLoad: 2,
  maxCapacity: 3,
  status: "available",
  isOnline: true
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

    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { patientId, doctorId, priority = "normal", reason } = body

    // Validate required fields
    if (!patientId || !doctorId) {
      return NextResponse.json(
        { success: false, message: 'Patient ID and Doctor ID are required' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ["low", "normal", "high", "urgent"]
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, message: 'Invalid priority level' },
        { status: 400 }
      )
    }

    // Check if patient exists and is available
    const patient = mockPatients.get(patientId)
    if (!patient) {
      return NextResponse.json(
        { success: false, message: 'Patient not found' },
        { status: 404 }
      )
    }

    if (patient.status !== "waiting") {
      return NextResponse.json(
        { success: false, message: 'Patient is not available for assignment' },
        { status: 400 }
      )
    }

    // Check if doctor exists and is available
    const doctor = mockDoctors.get(doctorId)
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      )
    }

    if (!doctor.isOnline) {
      return NextResponse.json(
        { success: false, message: 'Doctor is currently offline' },
        { status: 400 }
      )
    }

    if (doctor.currentLoad >= doctor.maxCapacity) {
      return NextResponse.json(
        { success: false, message: 'Doctor is at maximum capacity' },
        { status: 400 }
      )
    }

    // Create assignment
    const assignmentId = `assignment-${Date.now()}`
    const assignment = {
      id: assignmentId,
      patientId: patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doctorId,
      doctorName: doctor.name,
      priority: priority,
      reason: reason || "Manual assignment by admin",
      assignedAt: new Date().toISOString(),
      assignedBy: decoded.userId,
      status: "assigned"
    }

    // Store assignment
    mockAssignments.set(assignmentId, assignment)

    // Update patient status
    patient.status = "assigned"
    patient.assignedDoctorId = doctorId
    patient.assignedAt = assignment.assignedAt

    // Update doctor load
    doctor.currentLoad += 1
    if (doctor.currentLoad >= doctor.maxCapacity) {
      doctor.status = "busy"
    } else {
      doctor.status = "assigned"
    }

    // In a real implementation, emit WebSocket events
    // io.emit('patient-manually-assigned', assignment)
    // io.to(`doctor-${doctorId}`).emit('patient-assigned', {
    //   patient: { id: patientId, name: assignment.patientName },
    //   priority: priority,
    //   assignedAt: assignment.assignedAt
    // })

    return NextResponse.json({
      success: true,
      message: "Patient assigned successfully",
      data: {
        assignment: {
          patientId: assignment.patientId,
          patientName: assignment.patientName,
          doctorId: assignment.doctorId,
          doctorName: assignment.doctorName,
          priority: assignment.priority,
          reason: assignment.reason,
          assignedAt: assignment.assignedAt
        }
      }
    })

  } catch (error) {
    console.error('Error assigning patient:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign patient. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
