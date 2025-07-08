import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock doctors data for demonstration
const mockDoctors = new Map()

// Initialize mock doctors
mockDoctors.set("doctor-001", {
  id: "doctor-001",
  firstName: "Dr. Jane",
  lastName: "Smith",
  email: "jane.smith@healthcare.com",
  specialization: "Cardiology",
  licenseNumber: "MD-12345",
  phone: "+1234567890",
  isAvailable: true,
  status: "active",
  rating: 4.8,
  experience: 10,
  workingHours: {
    start: "09:00",
    end: "17:00"
  },
  createdAt: "2024-01-05T09:00:00.000Z",
  lastLogin: "2024-01-15T11:00:00.000Z"
})

mockDoctors.set("doctor-002", {
  id: "doctor-002",
  firstName: "Dr. Michael",
  lastName: "Johnson",
  email: "michael.johnson@healthcare.com",
  specialization: "Neurology",
  licenseNumber: "MD-67890",
  phone: "+1234567891",
  isAvailable: false,
  status: "active",
  rating: 4.9,
  experience: 15,
  workingHours: {
    start: "08:00",
    end: "16:00"
  },
  createdAt: "2024-01-03T08:00:00.000Z",
  lastLogin: "2024-01-15T09:30:00.000Z"
})

mockDoctors.set("doctor-003", {
  id: "doctor-003",
  firstName: "Dr. Sarah",
  lastName: "Wilson",
  email: "sarah.wilson@healthcare.com",
  specialization: "Pediatrics",
  licenseNumber: "MD-11111",
  phone: "+1234567892",
  isAvailable: true,
  status: "active",
  rating: 4.7,
  experience: 8,
  workingHours: {
    start: "10:00",
    end: "18:00"
  },
  createdAt: "2024-01-07T10:00:00.000Z",
  lastLogin: "2024-01-15T12:15:00.000Z"
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

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required.' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Filter doctors based on query parameters
    let filteredDoctors = Array.from(mockDoctors.values())

    // Filter by specialization
    if (specialization) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
      )
    }

    // Filter by status
    if (status) {
      if (status === 'available') {
        filteredDoctors = filteredDoctors.filter(doctor => doctor.isAvailable)
      } else if (status === 'unavailable') {
        filteredDoctors = filteredDoctors.filter(doctor => !doctor.isAvailable)
      } else {
        filteredDoctors = filteredDoctors.filter(doctor => doctor.status === status)
      }
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.firstName.toLowerCase().includes(searchLower) ||
        doctor.lastName.toLowerCase().includes(searchLower) ||
        doctor.email.toLowerCase().includes(searchLower) ||
        doctor.specialization.toLowerCase().includes(searchLower)
      )
    }

    // Calculate pagination
    const total = filteredDoctors.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedDoctors = filteredDoctors.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        doctors: paginatedDoctors,
        pagination: {
          total,
          page,
          totalPages,
          totalDoctors: total
        }
      }
    })

  } catch (error) {
    console.error('Error getting doctors:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get doctors. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
