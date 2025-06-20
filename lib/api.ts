const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

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

// Auth token management
class TokenManager {
  private static readonly TOKEN_KEY = "healthcare_token"

  static getToken(): string | null {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem(this.TOKEN_KEY)
    console.log("TokenManager.getToken() called, token exists:", !!token)
    return token
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return
    console.log("TokenManager.setToken() called, storing token")
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static removeToken(): void {
    if (typeof window === "undefined") return
    console.warn("TokenManager.removeToken() called - REMOVING TOKEN FROM LOCALSTORAGE")
    console.trace("Token removal stack trace:")
    localStorage.removeItem(this.TOKEN_KEY)
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
    const token = TokenManager.getToken()

    console.log(`API Request: ${options.method || 'GET'} ${url}`)

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
        // Check for unauthorized response
        if (response.status === 401 ||
            (data.success === false && data.message === "Not authorized, no token") ||
            (data.success === false && data.message?.toLowerCase().includes("unauthorized")) ||
            (data.success === false && data.message?.toLowerCase().includes("token")) ||
            (data.success === false && data.message?.toLowerCase().includes("expired"))) {

          console.warn("Authentication failed, clearing token and redirecting to login")

          // Clear the invalid token
          TokenManager.removeToken()

          // Call the global auth handler to handle logout and redirect
          if (globalAuthHandler) {
            globalAuthHandler()
          }

          // Throw a specific auth error
          throw new Error("UNAUTHORIZED")
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
      // Filter out undefined, null, and empty string values
      const filteredParams: Record<string, string> = {}
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filteredParams[key] = String(value)
        }
      })

      // Only add query string if we have valid parameters
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
    const token = TokenManager.getToken()
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
        // Check for unauthorized response
        if (response.status === 401 ||
            (data.success === false && data.message === "Not authorized, no token") ||
            (data.success === false && data.message?.toLowerCase().includes("unauthorized")) ||
            (data.success === false && data.message?.toLowerCase().includes("token")) ||
            (data.success === false && data.message?.toLowerCase().includes("expired"))) {

          console.warn("Authentication failed during upload, clearing token and redirecting to login")

          // Clear the invalid token
          TokenManager.removeToken()

          // Call the global auth handler to handle logout and redirect
          if (globalAuthHandler) {
            globalAuthHandler()
          }

          // Throw a specific auth error
          throw new Error("UNAUTHORIZED")
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
