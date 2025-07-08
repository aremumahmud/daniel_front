import { TokenManager } from "@/lib/api"

// WebSocket service for real-time notifications
class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<Function>> = new Map()
  private isConnecting = false
  private baseUrl: string

  constructor() {
    // Use WebSocket URL based on environment
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}`
      this.baseUrl = `${host}/ws`
    } else {
      // Fallback for SSR - will be set properly when connect() is called in browser
      this.baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws'
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Ensure we're in a browser environment
      if (typeof window === 'undefined') {
        reject(new Error('WebSocket can only be used in browser environment'))
        return
      }

      // Set baseUrl properly if not already set correctly
      if (!this.baseUrl || this.baseUrl.includes('localhost:3000')) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}`
        this.baseUrl = `${host}/ws`
      }

      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        // Wait for current connection attempt
        const checkConnection = () => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            resolve()
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'))
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        checkConnection()
        return
      }

      this.isConnecting = true
      const token = TokenManager.getToken()
      
      if (!token) {
        this.isConnecting = false
        reject(new Error('No authentication token available'))
        return
      }

      try {
        // Include token in WebSocket URL as query parameter
        const wsUrl = `${this.baseUrl}?token=${encodeURIComponent(token)}`
        this.socket = new WebSocket(wsUrl)

        this.socket.onopen = () => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          resolve()
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnecting = false
          this.socket = null
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          reject(error)
        }

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private scheduleReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  private handleMessage(data: any) {
    const { event, payload } = data
    
    if (event && this.listeners.has(event)) {
      const eventListeners = this.listeners.get(event)!
      eventListeners.forEach(listener => {
        try {
          listener(payload)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Subscribe to events
  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  // Unsubscribe from events
  off(event: string, listener: Function) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(listener)
    }
  }

  // Send message to server
  send(event: string, data?: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  // Join a room (for role-based notifications)
  joinRoom(room: string) {
    this.send('join-room', { room })
  }

  // Leave a room
  leaveRoom(room: string) {
    this.send('leave-room', { room })
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }
    this.listeners.clear()
    this.reconnectAttempts = 0
  }

  // Get connection status
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }

  // Specific methods for queue notifications
  subscribeToQueueNotifications(userRole: string, userId?: string) {
    if (userRole === 'admin') {
      this.joinRoom('admin-room')
      this.on('doctor-ready-notification', this.handleDoctorReadyNotification)
      this.on('queue-status-update', this.handleQueueStatusUpdate)
    } else if (userRole === 'doctor' && userId) {
      this.joinRoom(`doctor-room-${userId}`)
      this.on('patient-called', this.handlePatientCalled)
      this.on('queue-status-update', this.handleQueueStatusUpdate)
    }
  }

  private handleDoctorReadyNotification = (data: any) => {
    console.log('Doctor ready notification received:', data)
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('doctor-ready-notification', { detail: data }))
  }

  private handlePatientCalled = (data: any) => {
    console.log('Patient called notification received:', data)
    window.dispatchEvent(new CustomEvent('patient-called', { detail: data }))
  }

  private handleQueueStatusUpdate = (data: any) => {
    console.log('Queue status update received:', data)
    window.dispatchEvent(new CustomEvent('queue-status-update', { detail: data }))
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService()

// Auto-connect when token is available
if (typeof window !== 'undefined') {
  const token = TokenManager.getToken()
  if (token) {
    webSocketService.connect().catch(error => {
      console.error('Failed to auto-connect WebSocket:', error)
    })
  }
}

export default webSocketService
