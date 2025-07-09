import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock admin data for demonstration
const mockAdmins = new Map()

// Initialize mock admin data
mockAdmins.set("880h1733-h5ce-74g7-d049-779988773333", {
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
  permissions: ["manage_users", "manage_doctors", "manage_patients", "view_reports"],
  lastLogin: "2024-01-15T10:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:00:00.000Z"
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
    const user = extractUserFromToken(authHeader)
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
          error: "UNAUTHORIZED"
        },
        { status: 401 }
      )
    }

    // Get the admin's ID from the token
    const adminId = user.userId || user.id

    // Get admin data from mock database
    const admin = mockAdmins.get(adminId)
    
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
          error: "ADMIN_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        user: admin
      }
    })

  } catch (error) {
    console.error('Get admin profile error:', error)
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
