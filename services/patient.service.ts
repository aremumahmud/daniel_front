import { apiClient } from "@/lib/api"
import type { Patient, PatientDashboard, Appointment, HealthMetric, MedicalRecord, Notification } from "@/lib/types/api"

export interface BookAppointmentData {
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  type: "consultation" | "follow-up" | "check-up" | "emergency" | "procedure"
  reason: string
  priority: "low" | "medium" | "high" | "urgent"
}

export interface AddHealthMetricData {
  metricType: "blood_pressure" | "heart_rate" | "weight" | "temperature" | "blood_glucose"
  value?: number
  systolicValue?: number
  diastolicValue?: number
  unit: string
  notes?: string
}

export interface UpdatePatientProfileData {
  height?: {
    value: number
    unit: "cm" | "ft"
  }
  weight?: {
    value: number
    unit: "kg" | "lbs"
  }
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  emergencyContacts?: Array<{
    name: string
    relationship: string
    phoneMain: string
    phoneSecondary?: string
    email?: string
    isPrimary: boolean
  }>
  allergies?: Array<{
    allergen: string
    severity: "mild" | "moderate" | "severe"
    reaction: string
  }>
  chronicConditions?: Array<{
    condition: string
    diagnosedDate: Date
    status: "active" | "managed" | "resolved"
  }>
}

class PatientService {
  async getDashboard(): Promise<PatientDashboard> {
    const response = await apiClient.get<PatientDashboard>("/patient/dashboard")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get dashboard data")
  }

  async getProfile(): Promise<Patient> {
    const response = await apiClient.get<Patient>("/patient/profile")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get profile")
  }

  async updateProfile(data: UpdatePatientProfileData): Promise<Patient> {
    const response = await apiClient.put<Patient>("/patient/profile", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update profile")
  }

  async getAppointments(params?: {
    status?: string
    limit?: number
    page?: number
    startDate?: string
    endDate?: string
  }): Promise<{ appointments: Appointment[]; total: number; page: number; totalPages: number }> {
    const response = await apiClient.get("/patient/appointments", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get appointments")
  }

  async bookAppointment(data: BookAppointmentData): Promise<Appointment> {
    const response = await apiClient.post<Appointment>("/patient/appointments", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to book appointment")
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const response = await apiClient.delete(`/patient/appointments/${appointmentId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to cancel appointment")
    }
  }

  async getHealthMetrics(params?: {
    type?: string
    days?: number
    limit?: number
  }): Promise<HealthMetric[]> {
    const response = await apiClient.get<HealthMetric[]>("/patient/health-metrics", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get health metrics")
  }

  async addHealthMetric(data: AddHealthMetricData): Promise<HealthMetric> {
    const response = await apiClient.post<HealthMetric>("/patient/health-metrics", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to add health metric")
  }

  async getMedicalRecords(params?: {
    limit?: number
    page?: number
  }): Promise<{ records: MedicalRecord[]; total: number; page: number; totalPages: number }> {
    console.log("PatientService.getMedicalRecords() called with params:", params)

    // The apiClient.get() method now automatically filters out undefined values
    const response = await apiClient.get("/patient/medical-records", params)

    if (response.success && response.data) {
      return response.data as { records: MedicalRecord[]; total: number; page: number; totalPages: number }
    }

    throw new Error(response.message || "Failed to get medical records")
  }

  async getNotifications(params?: {
    unread?: boolean
    limit?: number
    page?: number
  }): Promise<Notification[]> {
    console.log("PatientService.getNotifications() called with params:", params)

    // The apiClient.get() method now automatically filters out undefined values
    const response = await apiClient.get<Notification[]>("/patient/notifications", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get notifications")
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.put(`/patient/notifications/${notificationId}/read`)

    if (!response.success) {
      throw new Error(response.message || "Failed to mark notification as read")
    }
  }
}

export const patientService = new PatientService()
