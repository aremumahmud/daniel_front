"use client"

import "@/lib/amplify"
import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { signIn, signOut, fetchAuthSession } from "aws-amplify/auth"
import type { User, UserRole } from "@/lib/types/api"
import { toast } from "@/hooks/use-toast"
import { setGlobalAuthHandler } from "@/lib/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  isAuthenticated: boolean
  // Self-service registration/profile editing is out of scope for this
  // build — accounts are provisioned by an admin directly in Cognito (see
  // AWS_INFRA_SETUP.md). Kept as stubs so the old admin-signup/doctor-signup
  // /settings pages that still call these don't crash the whole app; those
  // pages themselves need to be removed or reworked (see MIGRATION_NOTES.md).
  register: (userData: any) => Promise<User>
  updateProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Builds our internal User shape from a Cognito ID token's claims.
 * Cognito Groups (Receptionist/Doctor/Pharmacist/Student) become the
 * lowercased `role`; Student accounts additionally carry
 * `custom:matricNumber` so the app can scope their own data.
 */
function userFromIdTokenClaims(claims: Record<string, any>): User | null {
  const groups: string[] = Array.isArray(claims["cognito:groups"])
    ? claims["cognito:groups"]
    : typeof claims["cognito:groups"] === "string"
      ? claims["cognito:groups"].replace(/[[\]]/g, "").split(",").map((g: string) => g.trim()).filter(Boolean)
      : []

  const role = groups[0]?.toLowerCase() as UserRole | undefined
  if (!role) return null

  const firstName = claims.given_name || claims.email?.split("@")[0] || "User"
  const lastName = claims.family_name || ""

  return {
    _id: claims.sub,
    email: claims.email,
    role,
    matricNumber: claims["custom:matricNumber"],
    firstName,
    lastName,
    isActive: true,
    emailVerified: claims.email_verified === true || claims.email_verified === "true",
    fullName: `${firstName} ${lastName}`.trim(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

async function getCurrentUserFromSession(): Promise<User | null> {
  const session = await fetchAuthSession()
  const idToken = session.tokens?.idToken
  if (!idToken) return null
  return userFromIdTokenClaims(idToken.payload as Record<string, any>)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleUnauthorized = () => {
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
        const currentUser = await getCurrentUserFromSession()
        setUser(currentUser)
      } catch (error) {
        // No active Cognito session — user is simply logged out.
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true)
      const { isSignedIn } = await signIn({ username: email, password })

      if (!isSignedIn) {
        throw new Error("Additional sign-in step required (e.g. MFA or new password) — not supported yet")
      }

      const userData = await getCurrentUserFromSession()
      if (!userData) {
        throw new Error("Signed in, but no Cognito group is assigned to this account")
      }

      setUser(userData)
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.firstName}!`,
      })

      return userData
    } catch (error) {
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

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const register = async (): Promise<User> => {
    throw new Error("Self-service registration is disabled — ask an admin to create your account in Cognito")
  }

  const updateProfile = async (): Promise<void> => {
    throw new Error("Profile editing isn't supported yet in this build")
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    register,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
