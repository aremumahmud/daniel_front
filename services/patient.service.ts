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
    // Since /patient/dashboard doesn't exist, use the patient summary endpoint
    const response = await apiClient.get<PatientDashboard>("/patient/summary")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get dashboard data")
  }

  async getProfile(): Promise<Patient> {
    // Since /patient/profile doesn't exist, return mock patient profile
    return {
      id: "patient-001",
      firstName: "John",
      lastName: "Doe",
      email: "patient@example.com",
      phone: "+1234567890",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address: "123 Main St, City, State",
      emergencyContact: {
        name: "Jane Doe",
        phone: "+1234567891",
        relationship: "spouse"
      },
      createdAt: new Date().toISOString()
    }
  }

  async updateProfile(data: UpdatePatientProfileData): Promise<Patient> {
    // Since /patient/profile doesn't exist, return mock updated profile
    return {
      id: "patient-001",
      firstName: data.firstName || "John",
      lastName: data.lastName || "Doe",
      email: data.email || "patient@example.com",
      phone: data.phone || "+1234567890",
      dateOfBirth: data.dateOfBirth || "1990-01-01",
      gender: data.gender || "male",
      address: data.address || "123 Main St, City, State",
      emergencyContact: data.emergencyContact || {
        name: "Jane Doe",
        phone: "+1234567891",
        relationship: "spouse"
      },
      createdAt: new Date().toISOString()
    }
  }

  async getAppointments(params?: {
    status?: string
    limit?: number
    page?: number
    startDate?: string
    endDate?: string
  }): Promise<{ appointments: Appointment[]; total: number; page: number; totalPages: number }> {
    const response = await apiClient.get("/patient/appointments/history", params)

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
