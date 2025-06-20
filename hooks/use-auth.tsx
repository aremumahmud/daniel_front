"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import type { User } from "@/lib/types/api"
import { toast } from "@/hooks/use-toast"
import { setGlobalAuthHandler } from "@/lib/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (userData: any) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Set up global auth handler for API client
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("Global auth handler triggered - user unauthorized")
      setUser(null)
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      })
      router.push("/auth")
    }

    setGlobalAuthHandler(handleUnauthorized)
  }, [router])

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check if we have a token at all
        const hasToken = authService.isAuthenticated()
        console.log("Auth initialization - has valid token:", hasToken)

        if (hasToken) {
          console.log("Token found, attempting to get current user...")
          try {
            const userData = await authService.getCurrentUser()
            console.log("Current user loaded successfully:", userData)
            console.log("User role from API:", userData.role)
            setUser(userData)
          } catch (userError) {
            console.error("Failed to get current user:", userError)

            // Only clear session if it's definitely an auth error
            if (userError instanceof Error &&
                (userError.message === "UNAUTHORIZED" ||
                 userError.message === "Authentication token is invalid" ||
                 userError.message.includes("Not authorized"))) {
              console.log("Authentication failed, clearing session")
              await authService.logout()
            } else {
              // For other errors (like network issues), try to get user from token
              console.log("Non-auth error getting user data, trying token fallback")
              try {
                // Try to decode user from token as fallback
                const token = localStorage.getItem("healthcare_token")
                if (token) {
                  const payload = JSON.parse(atob(token.split('.')[1]))
                  console.log("Token payload for fallback:", payload)

                  // Don't create fallback user if we can't determine the role
                  if (!payload.role) {
                    console.error("No role found in token payload, cannot create fallback user")
                    console.log("Available payload fields:", Object.keys(payload))
                    return
                  }

                  const fallbackUser = {
                    _id: payload.id || payload.userId || payload.sub || "unknown",
                    email: payload.email || "unknown@example.com",
                    firstName: payload.firstName || payload.first_name || "Unknown",
                    lastName: payload.lastName || payload.last_name || "User",
                    role: payload.role, // Use actual role from token
                    emailVerified: payload.emailVerified || false,
                    avatarUrl: payload.avatarUrl,
                    isActive: true,
                    fullName: `${payload.firstName || "Unknown"} ${payload.lastName || "User"}`,
                    createdAt: new Date((payload.iat || Date.now() / 1000) * 1000),
                    updatedAt: new Date(),
                  }
                  console.log("Using fallback user from token:", fallbackUser)
                  console.log("Fallback user role:", fallbackUser.role)
                  console.log("Setting user in auth context...")
                  setUser(fallbackUser)
                }
              } catch (tokenError) {
                console.error("Failed to decode user from token:", tokenError)
              }
            }
          }
        } else {
          console.log("No valid token found, user not authenticated")
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        // Don't clear session for general initialization errors
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true)
      const response = await authService.login({ email, password })

      console.log("Login successful:", response)

      // Convert login response user to internal User type
      const userData: User = {
        _id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        emailVerified: response.user.emailVerified,
        avatarUrl: response.user.avatarUrl || undefined,
        isActive: true, // Assume active if login successful
        fullName: `${response.user.firstName} ${response.user.lastName}`,
        createdAt: new Date(), // Placeholder
        updatedAt: new Date(), // Placeholder
      }

      setUser(userData)
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.firstName}!`,
      })

      // Return the user data so the caller can use it immediately
      return userData
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: any): Promise<User> => {
    try {
      setLoading(true)
      const response = await authService.register(userData)

      // Convert registration response user to internal User type
      const newUser: User = {
        _id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        emailVerified: response.user.emailVerified,
        avatarUrl: response.user.avatarUrl || undefined,
        isActive: true, // Assume active if registration successful
        fullName: `${response.user.firstName} ${response.user.lastName}`,
        createdAt: new Date(), // Placeholder
        updatedAt: new Date(), // Placeholder
      }

      setUser(newUser)
      toast({
        title: "Registration Successful",
        description: `Welcome to HealthAuth, ${newUser.firstName}!`,
      })

      // Return the user data so the caller can use it immediately
      return newUser
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const updateProfile = async (data: any) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}