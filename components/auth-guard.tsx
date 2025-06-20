"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "doctor" | "patient"
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = "/auth",
  fallback
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't check while still loading
    if (loading) return

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page",
        variant: "destructive",
      })
      router.push(redirectTo)
      return
    }

    // Check role-based access if required
    if (requiredRole && user.role !== requiredRole) {
      console.log("AuthGuard: Role mismatch detected")
      console.log("Required role:", requiredRole)
      console.log("User role:", user.role)
      console.log("Redirecting to role-based dashboard")

      toast({
        title: "Access Denied",
        description: `This page requires ${requiredRole} privileges`,
        variant: "destructive",
      })

      // Redirect based on user's actual role
      const roleRedirects = {
        admin: "/dashboard",
        doctor: "/doctor/dashboard",
        patient: "/patient/dashboard"
      }

      const redirectUrl = roleRedirects[user.role] || "/"
      console.log("Redirecting to:", redirectUrl)
      router.push(redirectUrl)
      return
    }
  }, [user, loading, router, redirectTo, requiredRole])

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Specific guards for different roles
export function AdminGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="admin" {...props}>
      {children}
    </AuthGuard>
  )
}

export function DoctorGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="doctor" {...props}>
      {children}
    </AuthGuard>
  )
}

export function PatientGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard requiredRole="patient" {...props}>
      {children}
    </AuthGuard>
  )
}

// Hook version for use in components
export function useAuthCheck(requiredRole?: "admin" | "doctor" | "patient") {
  const { user, loading } = useAuth()
  const router = useRouter()

  const isAuthenticated = !!user && !loading
  const hasRequiredRole = !requiredRole || (user?.role === requiredRole)
  const isAuthorized = isAuthenticated && hasRequiredRole

  const redirectToLogin = () => {
    toast({
      title: "Authentication Required",
      description: "Please log in to access this feature",
      variant: "destructive",
    })
    router.push("/auth")
  }

  const redirectToHome = () => {
    const roleRedirects = {
      admin: "/dashboard",
      doctor: "/doctor/dashboard", 
      patient: "/patient/dashboard"
    }
    
    router.push(user ? roleRedirects[user.role] || "/" : "/")
  }

  return {
    user,
    loading,
    isAuthenticated,
    hasRequiredRole,
    isAuthorized,
    redirectToLogin,
    redirectToHome
  }
}
