import { apiClient, TokenManager } from "@/lib/api"
import type { User } from "@/lib/types/api"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: "patient" | "doctor" | "admin"
  phone?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: "admin" | "doctor" | "patient"
    emailVerified: boolean
    avatarUrl: string | null
  }
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface AdminLoginCredentials {
  email: string
  password: string
  adminCode: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other" | "prefer_not_to_say"
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  allergies?: string[]
  medicalHistory?: string[]
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials)

    if (response.success && response.user) {
      TokenManager.setToken(response.token)
      console.log("Login successful:", response.token)
      return response
    }

    throw new Error(response.message || "Login failed")
  }

  async adminLogin(credentials: AdminLoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/admin-login", credentials)

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token)
      console.log("Admin login successful:", response.data.token)
      return response.data
    }

    throw new Error(response.message || "Admin login failed")
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", userData)

    if (response.success && response.data) {
      TokenManager.setToken(response.data.token)
      return response.data
    }

    throw new Error(response.message || "Registration failed")
  }

  async getCurrentUser(): Promise<User> {
    // First check if we have a token
    if (!this.isAuthenticated()) {
      throw new Error("No authentication token found")
    }

    // First, get the user role from the token to determine which endpoint to use
    const tokenUser = this.getUserFromToken()
    console.log("Token user role:", tokenUser.role)

    try {
      let response: any

      // Use role-specific endpoints
      if (tokenUser.role === "admin") {
        console.log("Loading admin profile from /auth/admin/me")
        response = await apiClient.get("/auth/admin/me")
        console.log("Admin API response:", response)

        if (response.success && response.data && response.data.user) {
          // Convert admin API response to internal User type
          const adminUser = response.data.user
          const user: User = {
            _id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role as "admin" | "doctor" | "patient",
            emailVerified: adminUser.emailVerified,
            avatarUrl: adminUser.avatarUrl || undefined,
            isActive: adminUser.isActive,
            fullName: adminUser.fullName,
            lastLogin: adminUser.lastLogin ? new Date(adminUser.lastLogin) : undefined,
            createdAt: new Date(adminUser.createdAt),
            updatedAt: new Date(adminUser.updatedAt),
          }

          console.log("Admin user data loaded:", user)
          return user
        }
      } else if (tokenUser.role === "doctor") {
        console.log("Loading doctor profile from /doctor/me")
        response = await apiClient.get("/doctor/me")
        console.log("Doctor API response:", response)

        if (response.success && response.data && response.data.doctor) {
          const doctorData = response.data.doctor
          const user: User = {
            _id: doctorData.userId._id,
            email: doctorData.userId.email,
            firstName: doctorData.userId.firstName,
            lastName: doctorData.userId.lastName,
            role: doctorData.userId.role as "admin" | "doctor" | "patient",
            emailVerified: doctorData.userId.emailVerified,
            avatarUrl: doctorData.userId.avatarUrl || undefined,
            isActive: doctorData.userId.isActive,
            fullName: doctorData.userId.fullName,
            phone: doctorData.userId.phone,
            createdAt: new Date(doctorData.userId.createdAt),
            updatedAt: new Date(doctorData.userId.updatedAt),
          }

          console.log("Doctor user data loaded:", user)
          return user
        }
      } else {
        console.log("Loading patient profile from /auth/me")
        response = await apiClient.get("/auth/me")
        console.log("Patient API response:", response)

        if (response.success && response.data && response.data.user) {
          console.log("Patient user data loaded:", response.data.user)
          return response.data.user
        }
      }

      console.error("API response did not contain expected data:", response)

      // If API call succeeded but didn't return expected data, fall back to token
      console.warn("API response structure unexpected, falling back to token decode")
      return this.getUserFromToken()

    } catch (error) {
      console.error("Failed to get user profile:", error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })

      // Always fall back to token decode if API calls fail
      console.warn("API call failed, using token decode fallback")
      try {
        return this.getUserFromToken()
      } catch (tokenError) {
        console.error("Token decode also failed:", tokenError)
        throw new Error("Failed to get user profile from both API and token")
      }
    }
  }





  private getUserFromToken(): User {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new Error("No token available")
      }

      // Decode JWT token (basic decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log("Token payload:", payload)

      // Create a basic user object from token payload
      // Note: This is a fallback and may not have all user fields
      const firstName = payload.firstName || payload.first_name || "Unknown"
      const lastName = payload.lastName || payload.last_name || "User"

      const user: User = {
        _id: payload.id || payload.userId || payload.sub || "unknown",
        email: payload.email || "unknown@example.com",
        firstName: firstName,
        lastName: lastName,
        role: payload.role || "patient",
        emailVerified: payload.emailVerified || false,
        avatarUrl: payload.avatarUrl,
        isActive: true,
        fullName: payload.fullName || `${firstName} ${lastName}`,
        phone: payload.phone,
        createdAt: new Date((payload.iat || Date.now() / 1000) * 1000),
        updatedAt: new Date(),
      }

      console.log("User data decoded from token (fallback):", user)
      return user
    } catch (error) {
      console.error("Failed to decode user from token:", error)
      console.error("Token decode error details:", error)
      throw new Error("Invalid token format")
    }
  }



  async getProfile(): Promise<User> {
    // Use the same logic as getCurrentUser to get role-specific profile
    return this.getCurrentUser()
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put<{ user: User }>("/user/profile", data)

    if (response.success && response.data) {
      return response.data.user
    }

    throw new Error(response.message || "Failed to update profile")
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    const response = await apiClient.put("/auth/change-password", data)

    if (!response.success) {
      throw new Error(response.message || "Failed to change password")
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post("/auth/forgot-password", { email })

    if (!response.success) {
      throw new Error(response.message || "Failed to send reset email")
    }
  }

  async resetPassword(resetToken: string, password: string): Promise<void> {
    const response = await apiClient.put(`/auth/reset-password/${resetToken}`, { password })

    if (!response.success) {
      throw new Error(response.message || "Failed to reset password")
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.get(`/auth/verify-email/${token}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to verify email")
    }
  }

  async resendVerificationEmail(): Promise<void> {
    const response = await apiClient.post("/auth/resend-verification")

    if (!response.success) {
      throw new Error(response.message || "Failed to resend verification email")
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.error("Logout API call failed:", error)
    } finally {
      TokenManager.removeToken()
    }
  }

  isAuthenticated(): boolean {
    const token = TokenManager.getToken()
    if (!token) {
      console.log("No token found in localStorage")
      return false
    }

    // For basic auth check, just verify token exists and has valid format
    // Don't remove token here - let getCurrentUser() handle detailed validation
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.log("Token format invalid (not JWT)")
        return false
      }

      // Try to parse payload to ensure it's valid JSON
      const payload = JSON.parse(atob(parts[1]))

      // Only check expiration if exp field exists and is valid
      if (payload.exp && typeof payload.exp === 'number') {
        const currentTime = Date.now() / 1000
        const isExpired = payload.exp < currentTime

        if (isExpired) {
          console.log("Token is expired")
          console.log("Token expired at:", new Date(payload.exp * 1000))
          console.log("Current time:", new Date())
          return false
        }
      }

      console.log("Token appears valid")
      return true
    } catch (error) {
      console.error("Error parsing token:", error)
      return false
    }
  }
}

export const authService = new AuthService()
