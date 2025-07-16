import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock queue and patient data
const mockQueue = new Map()
const mockPatients = new Map()
const mockDoctors = new Map()

// Initialize mock patients
mockPatients.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  firstName: "John",
  lastName: "Doe",
  matricNumber: "2024/CS/001",
  age: 22,
  email: "john.doe@example.com",
  phone: "+1234567890",
  department: "Computer Science"
})

mockPatients.set("660f9511-f3ac-52e5-b827-557766551111", {
  id: "660f9511-f3ac-52e5-b827-557766551111",
  firstName: "Jane",
  lastName: "Smith",
  matricNumber: "2024/ENG/002",
  age: 21,
  email: "jane.smith@example.com",
  phone: "+1234567891",
  department: "Engineering"
})

mockPatients.set("770g0622-g4bd-63f6-c938-668877662333", {
  id: "770g0622-g4bd-63f6-c938-668877662333",
  firstName: "Michael",
  lastName: "Johnson",
  matricNumber: "2024/MED/003",
  age: 23,
  email: "michael.johnson@example.com",
  phone: "+1234567892",
  department: "Medicine"
})

// Initialize mock doctors (using real doctor ID)
mockDoctors.set("63c7fbca-214f-4220-8d42-571037cdc6af", {
  _id: "63c7fbca-214f-4220-8d42-571037cdc6af",
  userId: {
    firstName: "Mahmud",
    lastName: "AremuMahmud",
    fullName: "Dr. Mahmud AremuMahmud"
  },
  specialization: "Orthopedics",
  maxPatients: 5
})

// Initialize sample queue entries for the doctor
mockQueue.set("queue-001", {
  _id: "queue-001",
  queueId: "queue-001",
  patientId: "550e8400-e29b-41d4-a716-446655440000",
  doctorId: "63c7fbca-214f-4220-8d42-571037cdc6af",
  position: 1,
  priority: "medium",
  status: "assigned",
  reason: "Routine checkup",
  symptoms: ["headache", "fatigue"],
  queuedAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
  assignedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
  estimatedDuration: 30,
  estimatedStartTime: new Date(Date.now() + 5 * 60000).toISOString(), // 5 minutes from now
  type: "consultation",
  notes: "Patient reports mild symptoms",
  consultationStartTime: null,
  consultationEndTime: null
})

mockQueue.set("queue-002", {
  _id: "queue-002",
  queueId: "queue-002",
  patientId: "660f9511-f3ac-52e5-b827-557766551111",
  doctorId: "63c7fbca-214f-4220-8d42-571037cdc6af",
  position: 2,
  priority: "high",
  status: "in-consultation",
  reason: "Follow-up consultation",
  symptoms: ["back pain", "muscle stiffness"],
  queuedAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
  assignedAt: new Date(Date.now() - 10 * 60000).toISOString(), // 10 minutes ago
  estimatedDuration: 25,
  estimatedStartTime: new Date(Date.now() - 5 * 60000).toISOString(), // Started 5 minutes ago
  type: "follow-up",
  notes: "Follow-up for previous treatment",
  consultationStartTime: new Date(Date.now() - 5 * 60000).toISOString(),
  consultationEndTime: null
})

mockQueue.set("queue-003", {
  _id: "queue-003",
  queueId: "queue-003",
  patientId: "770g0622-g4bd-63f6-c938-668877662333",
  doctorId: "63c7fbca-214f-4220-8d42-571037cdc6af",
  position: 3,
  priority: "low",
  status: "assigned",
  reason: "General consultation",
  symptoms: ["minor cough"],
  queuedAt: new Date(Date.now() - 20 * 60000).toISOString(), // 20 minutes ago
  assignedAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
  estimatedDuration: 20,
  estimatedStartTime: new Date(Date.now() + 25 * 60000).toISOString(), // 25 minutes from now
  type: "consultation",
  notes: "Routine check for minor symptoms",
  consultationStartTime: null,
  consultationEndTime: null
})

function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    console.log('Decoded token:', decoded) // Debug log to see token structure
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

    // Get doctor ID from token - handle different possible structures
    const doctorId = user.doctorId || user.userId || user.id || user._id || "63c7fbca-214f-4220-8d42-571037cdc6af"
    console.log('Using doctor ID:', doctorId) // Debug log

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // assigned, in-consultation, completed
    const priority = searchParams.get('priority') // emergency, high, medium, low
    const includeCompleted = searchParams.get('includeCompleted') === 'true'

    // Filter queue entries for this doctor
    let doctorQueueEntries = Array.from(mockQueue.values()).filter((entry: any) =>
      entry.doctorId === doctorId
    )

    // Apply status filter
    if (status) {
      doctorQueueEntries = doctorQueueEntries.filter((entry: any) => entry.status === status)
    }

    // Apply priority filter
    if (priority) {
      doctorQueueEntries = doctorQueueEntries.filter((entry: any) => entry.priority === priority)
    }

    // Exclude completed unless specifically requested
    if (!includeCompleted) {
      doctorQueueEntries = doctorQueueEntries.filter((entry: any) => entry.status !== 'completed')
    }

    // Sort by position and priority
    doctorQueueEntries.sort((a: any, b: any) => {
      // First by status priority (in-consultation first, then assigned, then others)
      const statusPriority = { 'in-consultation': 0, 'assigned': 1, 'waiting': 2, 'completed': 3 }
      const aStatusPriority = statusPriority[a.status as keyof typeof statusPriority] || 4
      const bStatusPriority = statusPriority[b.status as keyof typeof statusPriority] || 4
      
      if (aStatusPriority !== bStatusPriority) {
        return aStatusPriority - bStatusPriority
      }
      
      // Then by priority level
      const priorityOrder = { 'emergency': 0, 'high': 1, 'medium': 2, 'low': 3 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Finally by position
      return a.position - b.position
    })

    // Format patient data
    const formatPatientData = (entry: any) => {
      const patient = mockPatients.get(entry.patientId)
      const waitTime = entry.queuedAt ? Math.floor((Date.now() - new Date(entry.queuedAt).getTime()) / (1000 * 60)) : 0
      const consultationTime = entry.consultationStartTime ? 
        Math.floor((Date.now() - new Date(entry.consultationStartTime).getTime()) / (1000 * 60)) : 0

      return {
        queueId: entry._id,
        patientId: entry.patientId,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          matricNumber: patient.matricNumber,
          age: patient.age,
          department: patient.department
        } : null,
        status: entry.status,
        priority: entry.priority,
        reason: entry.reason,
        symptoms: entry.symptoms || [],
        type: entry.type,
        position: entry.position,
        queuedAt: entry.queuedAt,
        assignedAt: entry.assignedAt,
        estimatedDuration: entry.estimatedDuration,
        estimatedStartTime: entry.estimatedStartTime,
        consultationStartTime: entry.consultationStartTime,
        consultationEndTime: entry.consultationEndTime,
        waitTime: waitTime,
        consultationTime: consultationTime,
        notes: entry.notes || "",
        // Formatted display data
        name: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient",
        queueNumber: `Q${entry.position.toString().padStart(3, '0')}`,
        estimatedTime: entry.estimatedStartTime ? 
          new Date(entry.estimatedStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
        waitTimeDisplay: `${waitTime} min`,
        consultationTimeDisplay: entry.consultationStartTime ? `${consultationTime} min` : null
      }
    }

    const formattedPatients = doctorQueueEntries.map(formatPatientData)

    // Separate patients by status
    const currentPatient = formattedPatients.find(p => p.status === 'in-consultation')
    const assignedPatients = formattedPatients.filter(p => p.status === 'assigned')
    const completedPatients = formattedPatients.filter(p => p.status === 'completed')

    // Get doctor info
    const doctor = mockDoctors.get(doctorId)

    // Calculate capacity information
    const activePatients = formattedPatients.filter(p => p.status !== 'completed').length
    const maxPatients = doctor?.maxPatients || 5
    const capacityPercentage = (activePatients / maxPatients) * 100

    const responseData = {
      patients: formattedPatients,
      count: formattedPatients.length,
      breakdown: {
        current: currentPatient || null,
        assigned: assignedPatients,
        completed: completedPatients,
        assignedCount: assignedPatients.length,
        completedCount: completedPatients.length
      },
      capacity: {
        current: activePatients,
        maximum: maxPatients,
        percentage: Math.round(capacityPercentage * 100) / 100,
        remaining: maxPatients - activePatients,
        status: capacityPercentage >= 100 ? 'at-capacity' : 
                capacityPercentage >= 80 ? 'near-capacity' : 'available'
      },
      statistics: {
        totalWaitTime: formattedPatients.reduce((sum, p) => sum + p.waitTime, 0),
        averageWaitTime: formattedPatients.length > 0 ? 
          Math.round(formattedPatients.reduce((sum, p) => sum + p.waitTime, 0) / formattedPatients.length) : 0,
        priorityDistribution: formattedPatients.reduce((acc: any, p) => {
          acc[p.priority] = (acc[p.priority] || 0) + 1
          return acc
        }, {}),
        typeDistribution: formattedPatients.reduce((acc: any, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1
          return acc
        }, {})
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error getting doctor current patients:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get current patients",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
