import { apiClient } from "@/lib/api"

// Types for settings data
export interface UserPreferences {
  language: string
  timezone: string
  dateFormat: string
  theme: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  appointmentReminders: boolean
  systemUpdates: boolean
  marketingEmails: boolean
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  twoFactorMethod?: string
  lastPasswordChange?: string
  loginSessions?: number
  lastLogin?: string
}

export interface DataExportRequest {
  format: "json" | "csv" | "pdf"
  includeDeleted?: boolean
  dataTypes?: ("profile" | "preferences" | "notifications" | "security_logs")[]
}

export interface DataExportResponse {
  exportId: string
  sentToEmail: string
  format: string
  completedAt: string
  downloadUrl?: string
  expiresAt?: string
}

export interface DataExportStatus {
  exportId: string
  status: "completed"
  downloadUrl?: string | null
  expiresAt?: string | null
  createdAt: string
  completedAt?: string
  sentToEmail: string
}

export interface AccountDeletionRequest {
  password: string
  reason?: string
  feedback?: string
}

export interface AccountDeletionResponse {
  deletionId: string
  scheduledDate: string
  cancellationDeadline: string
}

class SettingsService {
  // User Preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<{ preferences: UserPreferences }>("/user/preferences")
    
    if (response.success && response.data) {
      return response.data.preferences
    }
    
    throw new Error(response.message || "Failed to get user preferences")
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.put<{ preferences: UserPreferences }>("/user/preferences", preferences)
    
    if (response.success && response.data) {
      return response.data.preferences
    }
    
    throw new Error(response.message || "Failed to update user preferences")
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiClient.get<{ notifications: NotificationSettings }>("/user/notifications")
    
    if (response.success && response.data) {
      return response.data.notifications
    }
    
    throw new Error(response.message || "Failed to get notification settings")
  }

  async updateNotificationSettings(notifications: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const response = await apiClient.put<{ notifications: NotificationSettings }>("/user/notifications", notifications)
    
    if (response.success && response.data) {
      return response.data.notifications
    }
    
    throw new Error(response.message || "Failed to update notification settings")
  }

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    const response = await apiClient.get<{ security: SecuritySettings }>("/user/security")
    
    if (response.success && response.data) {
      return response.data.security
    }
    
    throw new Error(response.message || "Failed to get security settings")
  }

  async updateTwoFactorAuth(enabled: boolean, method?: string): Promise<{ twoFactorEnabled: boolean; method?: string; backupCodes?: string[] }> {
    const response = await apiClient.put<{ twoFactorEnabled: boolean; method?: string; backupCodes?: string[] }>("/user/security/2fa", {
      enabled,
      method
    })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || "Failed to update two-factor authentication")
  }

  // Data Export
  async requestDataExport(request: DataExportRequest): Promise<DataExportResponse> {
    const response = await apiClient.post<DataExportResponse>("/user/data-export", request)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || "Failed to request data export")
  }

  async getDataExportStatus(exportId: string): Promise<DataExportStatus> {
    const response = await apiClient.get<DataExportStatus>(`/user/data-export/${exportId}`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || "Failed to get data export status")
  }

  // Account Management
  async requestAccountDeletion(request: AccountDeletionRequest): Promise<AccountDeletionResponse> {
    const response = await apiClient.post<AccountDeletionResponse>("/user/delete-account", request)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || "Failed to request account deletion")
  }

  async cancelAccountDeletion(deletionId: string): Promise<void> {
    const response = await apiClient.delete(`/user/delete-account/${deletionId}`)
    
    if (!response.success) {
      throw new Error(response.message || "Failed to cancel account deletion")
    }
  }

  // Avatar Management
  async uploadAvatar(file: File): Promise<{ avatarUrl: string; thumbnailUrl: string }> {
    const formData = new FormData()
    formData.append("avatar", file)
    
    const response = await apiClient.upload<{ avatarUrl: string; thumbnailUrl: string }>("/user/avatar", formData)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || "Failed to upload avatar")
  }

  async deleteAvatar(): Promise<void> {
    const response = await apiClient.delete("/user/avatar")
    
    if (!response.success) {
      throw new Error(response.message || "Failed to delete avatar")
    }
  }
}

export const settingsService = new SettingsService()
