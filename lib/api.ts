import "@/lib/amplify"
import { fetchAuthSession, signOut } from "aws-amplify/auth"

// Calls go through the Next.js app/api/* proxy routes, which attach the
// Cognito bearer token server-side and forward to API Gateway. See
// AWS_INFRA_SETUP.md and MIGRATION_NOTES.md for the endpoint mapping.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Global auth handler - will be set by the auth context
let globalAuthHandler: (() => void) | null = null

export const setGlobalAuthHandler = (handler: () => void) => {
  globalAuthHandler = handler
}

// API Response types
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  statusCode?: number
}

interface ValidationError {
  field: string
  message: string
}

interface ApiError extends ApiResponse {
  errors?: ValidationError[]
}

/**
 * Replaces the old localStorage-based TokenManager. Amplify owns token
 * storage/refresh internally (via the Cognito refresh token flow) — this
 * is just a thin accessor so the rest of the app doesn't need to import
 * aws-amplify directly everywhere.
 */
class TokenManager {
  static async getToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() ?? null
    } catch {
      return null
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await signOut()
    } catch {
      // already signed out / no session — nothing to do
    }
  }
}

// Base API client
class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const token = await TokenManager.getToken()

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        // 401 = Cognito session invalid/expired, 403 = wrong Cognito group
        // for this route. Both mean the current session can't proceed.
        if (response.status === 401 || response.status === 403) {
          await TokenManager.removeToken()
          if (globalAuthHandler) globalAuthHandler()
          throw new Error(response.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED")
        }

        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${url}`)
        }

        throw new Error(data.message || "API request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint

    if (params) {
      const filteredParams: Record<string, string> = {}
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          filteredParams[key] = String(value)
        }
      })

      if (Object.keys(filteredParams).length > 0) {
        url = `${endpoint}?${new URLSearchParams(filteredParams)}`
      }
    }

    return this.request<T>(url, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = await TokenManager.getToken()
    const url = `${this.baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await TokenManager.removeToken()
          if (globalAuthHandler) globalAuthHandler()
          throw new Error(response.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED")
        }

        throw new Error(data.message || "Upload failed")
      }

      return data
    } catch (error) {
      console.error("Upload Error:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
export { TokenManager }
export type { ApiResponse, ApiError, ValidationError }
