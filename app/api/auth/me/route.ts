import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock users data for demonstration (same as login)
const mockUsers = new Map()

// Initialize mock users
mockUsers.set("770g0622-g4bd-63f6-c938-668877662222", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  email: "doctor@example.com",
  firstName: "Dr. John",
  lastName: "Smith",
  role: "doctor",
  emailVerified: true,
  avatarUrl: null,
  isActive: true,
  fullName: "Dr. John Smith",
  phone: "+1234567890",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
  lastLogin: "2024-01-15T10:00:00.000Z"
})

mockUsers.set("880h1733-h5ce-74g7-d049-779988773333", {
  id: "880h1733-h5ce-74g7-d049-779988773333",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  emailVerified: true,
  avatarUrl: null,
  isActive: true,
  fullName: "Admin User",
  phone: "+1234567891",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
  lastLogin: "2024-01-15T10:00:00.000Z"
})

mockUsers.set("550e8400-e29b-41d4-a716-446655440000", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "patient@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "patient",
  emailVerified: true,
  avatarUrl: null,
  isActive: true,
  fullName: "John Doe",
  phone: "+1234567892",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
  lastLogin: "2024-01-15T10:00:00.000Z"
})

mockUsers.set("990i2844-i6df-85h8-e150-880099884444", {
  id: "990i2844-i6df-85h8-e150-880099884444",
  email: "aremumahmud20031@gmail.com",
  firstName: "Dr. Aremu",
  lastName: "Mahmud",
  role: "doctor",
  emailVerified: true,
  avatarUrl: null,
  isActive: true,
  fullName: "Dr. Aremu Mahmud",
  phone: "+1234567893",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z",
  lastLogin: "2024-01-15T10:00:00.000Z"
})

// Helper function to extract JWT token and user info
function extractUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    // Authenticate user
    const tokenUser = extractUserFromToken(authHeader)
    if (!tokenUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    // Get user data from mock database
    const userId = tokenUser.userId || tokenUser.id
    const user = mockUsers.get(userId)
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    })

  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
