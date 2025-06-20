import { TokenManager } from "@/lib/api"

/**
 * Check if the current user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  const token = TokenManager.getToken()
  return !!token
}

/**
 * Check if the error is an authorization error
 */
export function isAuthError(error: any): boolean {
  if (!error) return false
  
  const message = error.message || error.toString()
  
  return (
    message === "UNAUTHORIZED" ||
    message === "Not authorized, no token" ||
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("token") ||
    message.toLowerCase().includes("expired") ||
    message.toLowerCase().includes("invalid token")
  )
}

/**
 * Handle authorization errors consistently
 */
export function handleAuthError(error: any, onUnauthorized?: () => void): boolean {
  if (isAuthError(error)) {
    console.warn("Authorization error detected:", error.message)
    
    // Clear any stored token
    TokenManager.removeToken()
    
    // Call the unauthorized handler if provided
    if (onUnauthorized) {
      onUnauthorized()
    }
    
    return true
  }
  
  return false
}

/**
 * Get user role from stored token (if available)
 * Note: This is not secure and should only be used for UI purposes
 */
export function getUserRoleFromToken(): string | null {
  try {
    const token = TokenManager.getToken()
    if (!token) return null
    
    // Decode JWT token (basic decode, not verification)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || null
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

/**
 * Check if token is expired (basic check)
 */
export function isTokenExpired(): boolean {
  try {
    const token = TokenManager.getToken()
    if (!token) return true
    
    // Decode JWT token
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    
    return payload.exp < currentTime
  } catch (error) {
    console.error("Error checking token expiration:", error)
    return true
  }
}

/**
 * Get redirect URL based on user role
 */
export function getRoleBasedRedirect(role: string): string {
  const redirects = {
    admin: "/dashboard",
    doctor: "/doctor/dashboard",
    patient: "/patient/dashboard"
  }
  
  return redirects[role as keyof typeof redirects] || "/"
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRole?: string): boolean {
  if (!requiredRole) return true
  return userRole === requiredRole
}

/**
 * Validate API response for auth errors
 */
export function validateApiResponse(response: any): boolean {
  if (!response) return false
  
  // Check for explicit auth error responses
  if (response.success === false) {
    const message = response.message || ""
    
    if (
      message === "Not authorized, no token" ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("token") ||
      message.toLowerCase().includes("expired")
    ) {
      return false
    }
  }
  
  return true
}
