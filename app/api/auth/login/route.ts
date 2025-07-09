import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock users data for demonstration
const mockUsers = new Map()

// Initialize mock users
mockUsers.set("doctor@example.com", {
  id: "770g0622-g4bd-63f6-c938-668877662222",
  email: "doctor@example.com",
  password: "doctor123", // In real app, this would be hashed
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

// Add the user's actual email as a doctor account
mockUsers.set("990i2844-i6df-85h8-e150-880099884444", {
  id: "990i2844-i6df-85h8-e150-880099884444",
  email: "aremumahmud20031@gmail.com",
  password: "password123", // In real app, this would be hashed
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

mockUsers.set("admin@example.com", {
  id: "880h1733-h5ce-74g7-d049-779988773333",
  email: "admin@example.com",
  password: "admin123", // In real app, this would be hashed
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

mockUsers.set("patient@example.com", {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "patient@example.com",
  password: "patient123", // In real app, this would be hashed
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("Login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required"
        },
        { status: 400 }
      )
    }

    // Find user by email (search through all users since we store by ID)
    let user = null
    for (const [userId, userData] of mockUsers.entries()) {
      if (userData.email.toLowerCase() === email.toLowerCase()) {
        user = userData
        break
      }
    }

    if (!user) {
      console.log("User not found for email:", email)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password"
        },
        { status: 401 }
      )
    }

    // Check password (in real app, use bcrypt.compare)
    if (user.password !== password) {
      console.log("Invalid password for user:", email)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password"
        },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Account is deactivated. Please contact support."
        },
        { status: 403 }
      )
    }

    // Create JWT token
    const tokenPayload = {
      id: user.id,
      userId: user.id, // Include both for compatibility
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret')

    // Update last login
    user.lastLogin = new Date().toISOString()

    console.log("Login successful for user:", email, "with role:", user.role)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl
      }
    })

  } catch (error) {
    console.error('Login error:', error)
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
