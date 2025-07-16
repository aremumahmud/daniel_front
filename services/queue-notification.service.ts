import webSocketService, { 
  PatientAssignedEvent, 
  PatientStatusChangedEvent, 
  QueueStatusUpdateEvent,
  CapacityWarningEvent,
  SystemNotificationEvent 
} from './websocket.service'

export interface NotificationOptions {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

export interface QueueNotification extends NotificationOptions {
  id: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'patient' | 'queue' | 'system' | 'capacity'
  targetRole?: 'doctor' | 'admin' | 'patient'
  targetUserId?: string
}

class QueueNotificationService {
  private notifications: QueueNotification[] = []
  private listeners: Map<string, Function[]> = new Map()
  private isInitialized: boolean = false
  private maxNotifications: number = 100

  constructor() {
    this.initializeWebSocketListeners()
  }

  // Initialize WebSocket event listeners
  private initializeWebSocketListeners(): void {
    if (this.isInitialized) return

    // Listen for patient assignment events
    webSocketService.on('patient_assigned', (data: PatientAssignedEvent) => {
      this.handlePatientAssigned(data)
    })

    // Listen for patient status changes
    webSocketService.on('patient_status_changed', (data: PatientStatusChangedEvent) => {
      this.handlePatientStatusChanged(data)
    })

    // Listen for queue status updates
    webSocketService.on('queue_status_update', (data: QueueStatusUpdateEvent) => {
      this.handleQueueStatusUpdate(data)
    })

    // Listen for capacity warnings
    webSocketService.on('capacity_warning', (data: CapacityWarningEvent) => {
      this.handleCapacityWarning(data)
    })

    // Listen for system notifications
    webSocketService.on('system_notification', (data: SystemNotificationEvent) => {
      this.handleSystemNotification(data)
    })

    this.isInitialized = true
  }

  // Handle patient assigned events
  private handlePatientAssigned(data: PatientAssignedEvent): void {
    const notification: QueueNotification = {
      id: `patient-assigned-${data.queueId}`,
      title: 'New Patient Assigned',
      message: `${data.patient.name} (${data.patient.matricNumber}) has been assigned to you for ${data.patient.reason}`,
      type: data.priority === 'emergency' ? 'error' : data.priority === 'high' ? 'warning' : 'info',
      timestamp: data.assignedAt,
      read: false,
      priority: data.priority,
      category: 'patient',
      targetRole: 'doctor',
      targetUserId: data.doctorId,
      duration: data.priority === 'emergency' ? 0 : 5000, // Emergency notifications persist
      persistent: data.priority === 'emergency',
      actions: [
        {
          label: 'View Patient',
          action: () => this.navigateToPatient(data.queueId),
          style: 'primary'
        },
        {
          label: 'Start Consultation',
          action: () => this.startConsultation(data.queueId),
          style: 'secondary'
        }
      ]
    }

    this.addNotification(notification)
    this.showBrowserNotification(notification)
  }

  // Handle patient status change events
  private handlePatientStatusChanged(data: PatientStatusChangedEvent): void {
    let message = `Patient status changed from ${data.oldStatus} to ${data.newStatus}`
    let type: 'info' | 'success' | 'warning' | 'error' = 'info'

    switch (data.newStatus) {
      case 'in-consultation':
        message = 'Patient consultation has started'
        type = 'info'
        break
      case 'completed':
        message = 'Patient consultation completed'
        type = 'success'
        break
      case 'cancelled':
        message = 'Patient appointment was cancelled'
        type = 'warning'
        break
      case 'no-show':
        message = 'Patient did not show up for appointment'
        type = 'warning'
        break
    }

    const notification: QueueNotification = {
      id: `status-changed-${data.queueId}-${Date.now()}`,
      title: 'Patient Status Update',
      message,
      type,
      timestamp: data.timestamp,
      read: false,
      priority: 'medium',
      category: 'patient',
      targetRole: 'doctor',
      targetUserId: data.doctorId,
      duration: 3000
    }

    this.addNotification(notification)
  }

  // Handle queue status updates
  private handleQueueStatusUpdate(data: QueueStatusUpdateEvent): void {
    // Only show significant queue updates
    if (data.totalWaiting > 10 || data.averageWaitTime > 45) {
      const notification: QueueNotification = {
        id: `queue-update-${Date.now()}`,
        title: 'Queue Status Alert',
        message: `${data.totalWaiting} patients waiting, average wait time: ${data.averageWaitTime} minutes`,
        type: data.totalWaiting > 15 ? 'warning' : 'info',
        timestamp: new Date().toISOString(),
        read: false,
        priority: data.totalWaiting > 15 ? 'high' : 'medium',
        category: 'queue',
        targetRole: 'doctor',
        duration: 4000
      }

      this.addNotification(notification)
    }
  }

  // Handle capacity warnings
  private handleCapacityWarning(data: CapacityWarningEvent): void {
    const notification: QueueNotification = {
      id: `capacity-warning-${data.doctorId}-${Date.now()}`,
      title: 'Capacity Warning',
      message: data.message,
      type: data.warningType === 'over_capacity' ? 'error' : 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      priority: data.warningType === 'over_capacity' ? 'urgent' : 'high',
      category: 'capacity',
      targetRole: 'doctor',
      targetUserId: data.doctorId,
      duration: data.warningType === 'over_capacity' ? 0 : 6000,
      persistent: data.warningType === 'over_capacity',
      actions: [
        {
          label: 'Adjust Capacity',
          action: () => this.navigateToCapacitySettings(),
          style: 'primary'
        }
      ]
    }

    this.addNotification(notification)
    this.showBrowserNotification(notification)
  }

  // Handle system notifications
  private handleSystemNotification(data: SystemNotificationEvent): void {
    const notification: QueueNotification = {
      id: `system-${Date.now()}`,
      title: data.title,
      message: data.message,
      type: data.type,
      timestamp: data.timestamp,
      read: false,
      priority: data.priority,
      category: 'system',
      targetRole: data.targetRole,
      targetUserId: data.targetUserId,
      duration: data.priority === 'urgent' ? 0 : 5000,
      persistent: data.priority === 'urgent'
    }

    this.addNotification(notification)
    
    if (data.priority === 'urgent' || data.priority === 'high') {
      this.showBrowserNotification(notification)
    }
  }

  // Add notification to the list
  private addNotification(notification: QueueNotification): void {
    this.notifications.unshift(notification)
    
    // Limit the number of stored notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }

    // Emit notification event
    this.emit('notification_added', notification)
  }

  // Show browser notification
  private showBrowserNotification(notification: QueueNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.persistent
      })

      browserNotification.onclick = () => {
        window.focus()
        if (notification.actions && notification.actions.length > 0) {
          notification.actions[0].action()
        }
        browserNotification.close()
      }

      // Auto-close non-persistent notifications
      if (!notification.persistent && notification.duration && notification.duration > 0) {
        setTimeout(() => {
          browserNotification.close()
        }, notification.duration)
      }
    }
  }

  // Navigation helpers
  private navigateToPatient(queueId: string): void {
    // This would typically use Next.js router
    window.location.href = `/doctor/queue/${queueId}`
  }

  private startConsultation(queueId: string): void {
    // This would typically call an API to start consultation
    console.log('Starting consultation for queue:', queueId)
  }

  private navigateToCapacitySettings(): void {
    window.location.href = '/doctor/settings/capacity'
  }

  // Public methods
  public getNotifications(): QueueNotification[] {
    return [...this.notifications]
  }

  public getUnreadNotifications(): QueueNotification[] {
    return this.notifications.filter(n => !n.read)
  }

  public markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.emit('notification_read', notification)
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
    this.emit('all_notifications_read', null)
  }

  public removeNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId)
    if (index > -1) {
      const removed = this.notifications.splice(index, 1)[0]
      this.emit('notification_removed', removed)
    }
  }

  public clearAllNotifications(): void {
    this.notifications = []
    this.emit('all_notifications_cleared', null)
  }

  // Request browser notification permission
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Event system
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return

    if (callback) {
      const callbacks = this.listeners.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in notification event listener for ${event}:`, error)
        }
      })
    }
  }
}

// Export singleton instance
export const queueNotificationService = new QueueNotificationService()
export default queueNotificationService
