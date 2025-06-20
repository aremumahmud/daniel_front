"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

interface AuthGuardOptions {
  redirectTo?: string
  showToast?: boolean
  requiredRole?: "admin" | "doctor" | "patient"
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const {
    redirectTo = "/auth",
    showToast = true,
    requiredRole
  } = options
  
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  useEffect(() => {
    // Don't check while still loading
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      if (showToast) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive",
        })
      }
      router.push(redirectTo)
      return
    }

    // Check role-based access if required
    if (requiredRole && user.role !== requiredRole) {
      if (showToast) {
        toast({
          title: "Access Denied",
          description: `This page requires ${requiredRole} privileges`,
          variant: "destructive",
        })
      }
      
      // Redirect based on user's actual role
      const roleRedirects = {
        admin: "/dashboard",
        doctor: "/doctor/dashboard", 
        patient: "/patient/dashboard"
      }
      
      router.push(roleRedirects[user.role] || "/")
      return
    }
  }, [user, loading, router, redirectTo, showToast, requiredRole])

  const handleUnauthorized = () => {
    if (showToast) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      })
    }
    logout()
    router.push(redirectTo)
  }

  return {
    isAuthenticated: !!user && !loading,
    isLoading: loading,
    user,
    handleUnauthorized
  }
}

// Higher-order component for protecting pages
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: AuthGuardOptions = {}
) {
  return function AuthGuardedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuthGuard(options)

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null // Will redirect in useAuthGuard
    }

    return <Component {...props} />
  }
}
