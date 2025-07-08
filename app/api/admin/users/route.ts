import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock users data for demonstration
const mockUsers = new Map()

// Initialize mock users
mockUsers.set("user-001", {
  id: "user-001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  role: "patient",
  status: "active",
  createdAt: "2024-01-10T08:00:00.000Z",
  lastLogin: "2024-01-15T10:30:00.000Z"
})

mockUsers.set("user-002", {
  id: "user-002",
  firstName: "Dr. Jane",
  lastName: "Smith",
  email: "jane.smith@healthcare.com",
  role: "doctor",
  status: "active",
  specialization: "Cardiology",
  licenseNumber: "MD-12345",
  createdAt: "2024-01-05T09:00:00.000Z",
  lastLogin: "2024-01-15T11:00:00.000Z"
})

mockUsers.set("user-003", {
  id: "user-003",
  firstName: "Admin",
  lastName: "User",
  email: "admin@healthcare.com",
  role: "admin",
  status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
  lastLogin: "2024-01-15T12:00:00.000Z"
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
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Filter users based on query parameters
    let filteredUsers = Array.from(mockUsers.values())

    // Filter by role
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    // Filter by status
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    // Calculate pagination
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedUsers = filteredUsers.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        users: paginatedUsers,
        total,
        page,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error getting users:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get users. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
