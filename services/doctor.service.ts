import { apiClient } from "@/lib/api"
import type { Doctor, DoctorDashboard, Appointment, Patient, MedicalRecord } from "@/lib/types/api"

// Queue Management Types
export interface DoctorStatus {
  doctorId: string
  isOnline: boolean
  isAvailable: boolean
  status: 'offline' | 'online' | 'available' | 'busy' | 'on-break'
  breakType?: 'lunch' | 'meeting' | 'emergency' | 'break'
  breakDuration?: number
  breakStartTime?: string
  currentPatients: number
  maxPatients: number
  averageConsultationTime: number
  workingHours: {
    start: string
    end: string
  }
  specializations: string[]
  preferredPatientTypes: string[]
  capacity: {
    current: number
    maximum: number
    percentage: number
    availabilityStatus: string
  }
  isOnBreak: boolean
  breakTimeRemaining: number
}

export interface QueuePatient {
  queueId: string
  patientId: string
  patient: {
    firstName: string
    lastName: string
    matricNumber: string
    age: number
    department: string
  }
  status: 'waiting' | 'assigned' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show'
  priority: 'emergency' | 'high' | 'medium' | 'low'
  reason: string
  symptoms: string[]
  type: string
  position: number
  queuedAt: string
  assignedAt?: string
  consultationStartTime?: string
  consultationEndTime?: string
  estimatedDuration: number
  actualDuration?: number
  waitTime: number
  consultationTime?: number
  notes?: string
  consultationSummary?: any
}

export interface BreakData {
  isOnBreak: boolean
  breakType?: 'lunch' | 'meeting' | 'emergency' | 'break'
  duration?: number
  notes?: string
}

export interface CapacitySettings {
  maxPatients?: number
  averageConsultationTime?: number
  workingHours?: {
    start?: string
    end?: string
  }
  specializations?: string[]
  preferredPatientTypes?: string[]
}

export interface PatientStatusUpdate {
  status: string
  notes?: string
  startTime?: string
  completedAt?: string
  consultationSummary?: {
    diagnosis?: string
    treatment?: string
    followUp?: string
    prescriptions?: any[]
    notes?: string
  }
}

// Doctor Profile Types
export interface UpdateDoctorProfileData {
  specialization?: string
  consultationFee?: number
  workingHours?: {
    [key: string]: {
      isAvailable?: boolean
      startTime?: string
      endTime?: string
      breakTime?: {
        start: string
        end: string
      }
    }
  }
  isAvailable?: boolean
}

// Appointment Types
export interface CreateAppointmentData {
  patientId: string
  appointmentDate: string
  appointmentTime: string
  duration?: number
  type: "consultation" | "follow-up" | "check-up" | "emergency"
  reason: string
  priority?: "low" | "medium" | "high"
  isVirtual?: boolean
  notes?: string
}

export interface UpdateAppointmentData {
  status?: "scheduled" | "confirmed" | "pending" | "cancelled" | "completed" | "no-show"
  appointmentTime?: string
  notes?: string
  priority?: "low" | "medium" | "high"
}

// Medical Record Types
export interface CreateMedicalRecordData {
  patientId: string
  appointmentId?: string
  recordType: "consultation" | "lab-result" | "prescription" | "diagnosis"
  chiefComplaint: string
  presentIllness?: string
  physicalExamination?: string
  diagnosis: Array<{
    primary: boolean
    code: string
    description: string
  }>
  treatment: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }>
  vitalSigns: {
    bloodPressure?: {
      systolic: number
      diastolic: number
    }
    heartRate?: number
    temperature?: number
    respiratoryRate?: number
    oxygenSaturation?: number
    weight?: number
    height?: number
  }
  labResults?: Array<{
    test: string
    result: string
    date: string
  }>
  followUpInstructions?: string
  nextAppointment?: string
  notes?: string
}

// Patient Management Types
export interface AddPatientData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth: string
  gender?: "male" | "female" | "other"
  insurance?: string
  reason?: string
}

// Schedule Types
export interface ScheduleException {
  date: string
  isAvailable: boolean
  reason: string
  type: "unavailable" | "modified"
  customHours?: {
    startTime: string
    endTime: string
  }
}

// Analytics Types
export interface AnalyticsParams {
  period: "daily" | "weekly" | "monthly" | "yearly" | "custom"
  startDate?: string
  endDate?: string
}

class DoctorService {
  // ===== DOCTOR PROFILE APIs =====
  async getProfile(): Promise<Doctor> {
    // Since /doctor/me doesn't exist, return mock doctor profile
    return {
      id: "doctor-001",
      firstName: "Dr. John",
      lastName: "Smith",
      email: "doctor@healthcare.com",
      specialization: "General Medicine",
      licenseNumber: "MD-12345",
      phone: "+1234567890",
      isAvailable: true,
      rating: 4.8,
      experience: 10,
      createdAt: new Date().toISOString()
    }
  }

  async updateProfile(data: UpdateDoctorProfileData): Promise<Doctor> {
    // Since /doctor/me doesn't exist, return mock updated profile
    return {
      id: "doctor-001",
      firstName: data.firstName || "Dr. John",
      lastName: data.lastName || "Smith",
      email: "doctor@healthcare.com",
      specialization: data.specialization || "General Medicine",
      licenseNumber: "MD-12345",
      phone: data.phone || "+1234567890",
      isAvailable: true,
      rating: 4.8,
      experience: 10,
      createdAt: new Date().toISOString()
    }
  }

  // ===== DOCTOR SETTINGS APIs =====
  async updateBasicProfile(data: { firstName: string; lastName: string; phone: string }): Promise<any> {
    const response = await apiClient.put("/doctor/profile/basic", data)

    if (response.success) {
      return response.data
    }

    throw new Error(response.message || "Failed to update basic profile")
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    const response = await apiClient.put("/doctor/password", data)

    if (!response.success) {
      throw new Error(response.message || "Failed to change password")
    }
  }

  async getNotificationPreferences(): Promise<any> {
    const response = await apiClient.get<{ notifications: any }>("/doctor/preferences/notifications")

    if (response.success && response.data) {
      return response.data.notifications
    }

    throw new Error(response.message || "Failed to get notification preferences")
  }

  async updateNotificationPreferences(preferences: any): Promise<any> {
    const response = await apiClient.put("/doctor/preferences/notifications", preferences)

    if (response.success) {
      return response.data
    }

    throw new Error(response.message || "Failed to update notification preferences")
  }

  async uploadAvatar(formData: FormData): Promise<any> {
    const response = await apiClient.upload("/doctor/avatar", formData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to upload avatar")
  }

  async removeAvatar(): Promise<void> {
    const response = await apiClient.delete("/doctor/avatar")

    if (!response.success) {
      throw new Error(response.message || "Failed to remove avatar")
    }
  }

  async updateCredentials(data: {
    licenseNumber: string;
    experience: number;
    education: Array<{ degree: string; institution: string; year: number }>;
    certifications: string[];
  }): Promise<any> {
    const response = await apiClient.put("/doctor/credentials", data)

    if (response.success) {
      return response.data
    }

    throw new Error(response.message || "Failed to update credentials")
  }

  async getAccountStatus(): Promise<any> {
    const response = await apiClient.get("/doctor/account/status")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get account status")
  }

  async deactivateAccount(data: { reason: string; reactivationDate?: string }): Promise<any> {
    const response = await apiClient.put("/doctor/account/deactivate", data)

    if (response.success) {
      return response.data
    }

    throw new Error(response.message || "Failed to deactivate account")
  }

  async reactivateAccount(): Promise<any> {
    const response = await apiClient.put("/doctor/account/reactivate")

    if (response.success) {
      return response.data
    }

    throw new Error(response.message || "Failed to reactivate account")
  }

  async requestDataExport(options: {
    format: string;
    includePatientData: boolean;
    includeAppointments: boolean;
    includeMedicalRecords: boolean;
  }): Promise<any> {
    const response = await apiClient.post("/doctor/data/export", options)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to request data export")
  }

  async getDataExportStatus(exportId: string): Promise<any> {
    const response = await apiClient.get(`/doctor/data/export/${exportId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get export status")
  }

  // ===== DASHBOARD API =====
  async getDashboard(): Promise<DoctorDashboard> {
    const response = await apiClient.get<DoctorDashboard>("/doctor/dashboard")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get dashboard data")
  }

  // ===== APPOINTMENT MANAGEMENT APIs =====
  async getAppointments(params?: {
    date?: string
    dateFrom?: string
    dateTo?: string
    status?: string
    type?: string
    patientId?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: string
  }): Promise<{ appointments: Appointment[]; pagination: any }> {
    const response = await apiClient.get("/doctor/appointments", params)

    if (response.success && response.data) {
      return response.data as { appointments: Appointment[]; pagination: any }
    }

    throw new Error(response.message || "Failed to get appointments")
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await apiClient.post<Appointment>("/doctor/appointments", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create appointment")
  }

  async updateAppointment(appointmentId: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(`/doctor/appointments/${appointmentId}`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update appointment")
  }

  async cancelAppointment(appointmentId: string, reason: string, notifyPatient = true): Promise<void> {
    // Use PUT to update status to cancelled instead of DELETE
    const response = await apiClient.put(`/doctor/appointments/${appointmentId}`, {
      status: "cancelled",
      notes: reason,
      notifyPatient
    })

    if (!response.success) {
      throw new Error(response.message || "Failed to cancel appointment")
    }
  }

  async getAvailableSlots(date: string, duration = 30): Promise<any> {
    const response = await apiClient.get("/doctor/appointments/available-slots", {
      date,
      duration
    })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get available slots")
  }

  // ===== PATIENT MANAGEMENT APIs =====
  async getPatients(params?: {
    search?: string
    page?: number
    limit?: number
    status?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<{ patients: Patient[]; pagination: any }> {
    const response = await apiClient.get("/doctor/patients", params)

    if (response.success && response.data) {
      return response.data as { patients: Patient[]; pagination: any }
    }

    throw new Error(response.message || "Failed to get patients")
  }

  async getMyPatients(params?: {
    search?: string
    page?: number
    limit?: number
    status?: string
    sortBy?: string
    sortOrder?: string
  }): Promise<{ patients: Patient[]; pagination: any }> {
    const response = await apiClient.get("/doctor/my-patients", params)

    if (response.success && response.data) {
      return response.data as { patients: Patient[]; pagination: any }
    }

    throw new Error(response.message || "Failed to get my patients")
  }

  async getPatientDetails(patientId: string): Promise<any> {
    const response = await apiClient.get<any>(`/doctor/patients/${patientId}`)

    if (response.success) {
      // Return the full response to handle nested structure in component
      return response
    }

    throw new Error(response.message || "Failed to get patient details")
  }

  async getPatientMedicalHistory(patientId: string): Promise<any> {
    const response = await apiClient.get(`/doctor/patients/${patientId}/medical-history`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get patient medical history")
  }

  // ===== NOTIFICATION APIs =====
  async getNotifications(params?: {
    unread?: boolean
    type?: string
    priority?: string
    limit?: number
    page?: number
  }): Promise<{ notifications: any[]; unreadCount: number; pagination: any }> {
    const response = await apiClient.get("/doctor/notifications", params)

    if (response.success && response.data) {
      return response.data as { notifications: any[]; unreadCount: number; pagination: any }
    }

    throw new Error(response.message || "Failed to get notifications")
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.put(`/doctor/notifications/${notificationId}/read`)

    if (!response.success) {
      throw new Error(response.message || "Failed to mark notification as read")
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const response = await apiClient.put("/doctor/notifications/mark-all-read")

    if (!response.success) {
      throw new Error(response.message || "Failed to mark all notifications as read")
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const response = await apiClient.delete(`/doctor/notifications/${notificationId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete notification")
    }
  }

  // ===== MEDICAL RECORDS APIs =====
  async getMedicalRecords(params?: {
    patientId?: string
    recordType?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }): Promise<{ records: MedicalRecord[]; pagination: any }> {
    const response = await apiClient.get("/doctor/medical-records", params)

    if (response.success && response.data) {
      return response.data as { records: MedicalRecord[]; pagination: any }
    }

    throw new Error(response.message || "Failed to get medical records")
  }

  async createMedicalRecord(data: CreateMedicalRecordData): Promise<MedicalRecord> {
    const response = await apiClient.post<MedicalRecord>("/doctor/medical-records", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create medical record")
  }

  async updateMedicalRecord(recordId: string, data: Partial<CreateMedicalRecordData>): Promise<MedicalRecord> {
    const response = await apiClient.put<MedicalRecord>(`/doctor/medical-records/${recordId}`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update medical record")
  }

  // ===== SCHEDULE MANAGEMENT APIs =====
  async getSchedule(): Promise<any> {
    const response = await apiClient.get("/doctor/schedule")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get schedule")
  }

  async updateSchedule(scheduleData: any): Promise<any> {
    const response = await apiClient.put("/doctor/schedule", scheduleData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update schedule")
  }

  async addScheduleException(exception: ScheduleException): Promise<any> {
    const response = await apiClient.post("/doctor/schedule/exceptions", exception)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to add schedule exception")
  }

  // ===== ANALYTICS APIs =====
  async getAnalytics(params?: AnalyticsParams): Promise<any> {
    const response = await apiClient.get("/doctor/analytics", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get analytics")
  }

  async getRevenueReport(params?: AnalyticsParams): Promise<any> {
    const response = await apiClient.get("/doctor/analytics/revenue", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get revenue report")
  }

  // ===== COMMUNICATION APIs =====
  async getMessages(): Promise<any> {
    const response = await apiClient.get("/doctor/messages")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get messages")
  }

  async getConversationMessages(conversationId: string): Promise<any> {
    const response = await apiClient.get(`/doctor/messages/${conversationId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get conversation messages")
  }

  async sendMessage(conversationId: string, content: string): Promise<any> {
    const response = await apiClient.post(`/doctor/messages/${conversationId}`, { content })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to send message")
  }

  // ===== QUEUE NOTIFICATION APIs =====
  async requestNextPatient(data?: { message?: string; urgency?: string }): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await apiClient.post("/doctor/queue/request-next-patient", data || {})

    if (response.success) {
      return {
        success: true,
        message: response.message || "Admin has been notified. Next patient will be called shortly.",
        data: response.data
      }
    }

    return {
      success: false,
      message: response.message || "No patients in queue at the moment."
    }
  }

  async getQueueStatus(): Promise<any> {
    // Get current user to determine doctor ID
    const currentUser = await this.getCurrentUser()
    const doctorId = currentUser._id || currentUser.id

    const response = await apiClient.get(`/queue/doctors/${doctorId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get queue status")
  }

  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get("/doctor/me")

    if (response.success && response.data) {
      return response.data.user || response.data
    }

    throw new Error(response.message || "Failed to get current user")
  }

  async getDoctorQueue(doctorId?: string): Promise<any> {
    // If no doctorId provided, get current user's ID
    if (!doctorId) {
      const currentUser = await this.getCurrentUser()
      console.log(currentUser, "ddidnj")
      doctorId = currentUser.doctor._id || currentUser.doctor.id
    }

    const response = await apiClient.get(`/queue/doctors/${doctorId}/current-patients`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get doctor queue")
  }

  async getDoctorAvailability(): Promise<any> {
    const response = await apiClient.get("/doctor/availability")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get doctor availability")
  }

  // ===== CONSULTATION MANAGEMENT APIs =====
  async completeConsultation(consultationId: string, data: {
    duration: number
    notes: string
    followUpRequired?: boolean
    nextAppointmentDate?: string
    prescriptions?: any[]
    diagnosis?: any[]
    recommendations?: string[]
    testsOrdered?: any[]
    referrals?: any[]
    consultationFee?: number
  }): Promise<any> {
    const response = await apiClient.post(`/doctor/consultations/${consultationId}/complete`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to complete consultation")
  }

  async startConsultation(consultationId: string): Promise<any> {
    const response = await apiClient.post(`/doctor/consultations/${consultationId}/start`, {})

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to start consultation")
  }

  async getCurrentConsultation(): Promise<any> {
    const response = await apiClient.get("/doctor/consultations/current")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get current consultation")
  }

  async getConsultationDetails(consultationId: string): Promise<any> {
    const response = await apiClient.get(`/doctor/consultations/${consultationId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get consultation details")
  }

  async getConsultationHistory(params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
    patientId?: string
  }): Promise<any> {
    const response = await apiClient.get("/doctor/consultations/history", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get consultation history")
  }

  async cancelConsultation(consultationId: string, reason: string): Promise<any> {
    const response = await apiClient.post(`/doctor/consultations/${consultationId}/cancel`, { reason })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to cancel consultation")
  }

  // ===== LEGACY METHODS (for backward compatibility) =====
  async addPatient(data: AddPatientData): Promise<Patient> {
    // Note: This might not be needed if doctors only select from existing patients
    // But keeping for backward compatibility
    const response = await apiClient.post<Patient>("/doctor/patients", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to add patient")
  }

  // ===== COMPREHENSIVE QUEUE MANAGEMENT APIs =====

  // Get current doctor info
  async getCurrentDoctor(): Promise<any> {
    const response = await apiClient.get("/doctor/me")

    if (response.success && response.data) {
      return response.data.doctor
    }

    throw new Error(response.message || "Failed to get doctor info")
  }

  // Doctor Status Management
  async getDoctorStatus(): Promise<DoctorStatus> {
    const response = await apiClient.get("/doctor/status")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get doctor status")
  }

  async updateDoctorStatus(data: {
    isOnline?: boolean
    isAvailable?: boolean
    status?: string
    notes?: string
  }): Promise<DoctorStatus> {
    const response = await apiClient.put("/doctor/status", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update doctor status")
  }

  // Break Management
  async startBreak(data: BreakData): Promise<any> {
    const response = await apiClient.post("/doctor/break", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to start break")
  }

  async endBreak(): Promise<any> {
    const response = await apiClient.post("/doctor/break", { isOnBreak: false })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to end break")
  }

  async getBreakInfo(): Promise<any> {
    const response = await apiClient.get("/doctor/break")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get break information")
  }

  // Capacity Management
  async getCapacitySettings(): Promise<any> {
    const response = await apiClient.get("/doctor/capacity")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get capacity settings")
  }

  async updateCapacitySettings(data: CapacitySettings): Promise<any> {
    const response = await apiClient.put("/doctor/capacity", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update capacity settings")
  }

  // Current Patients Management
  async getCurrentPatients(filters?: {
    status?: string
    priority?: string
    includeCompleted?: boolean
  }): Promise<any> {
    const response = await apiClient.get("/doctor/current-patients", filters)

    if (response.success && response.data) {
      return response
    }

    throw new Error(response.message || "Failed to get current patients")
  }

  // Patient Status Management
  async updatePatientStatus(queueId: string, data: PatientStatusUpdate): Promise<any> {
    const response = await apiClient.put(`/queue/patient/${queueId}/status`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update patient status")
  }

  async getPatientStatus(queueId: string): Promise<any> {
    const response = await apiClient.get(`/queue/patient/${queueId}/status`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get patient status")
  }

  // Queue Status and Assignment
  async getQueueStatus(filters?: {
    includeAssigned?: boolean
    priority?: string
    status?: string
  }): Promise<any> {
    const response = await apiClient.get("/doctor/queue-status", filters)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get queue status")
  }

  async assignPatientToSelf(queueId: string): Promise<any> {
    // The API will get doctorId from the JWT token
    const response = await apiClient.post("/queue/assign-patient", {
      queueId
    })

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to assign patient")
  }

  async getAssignmentData(): Promise<any> {
    const response = await apiClient.get("/queue/assign-patient")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get assignment data")
  }

  // ===== LEGACY QUEUE MANAGEMENT APIs (for backward compatibility) =====
  async getQueueStatusDetailed(): Promise<any> {
    return this.getQueueStatus()
  }

  async addPatientToQueue(data: {
    patientId: string
    priority: string
    reason: string
    symptoms?: string
    type: string
    appointmentId?: string
    notes?: string
  }): Promise<any> {
    const response = await apiClient.post("/queue/add-patient", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to add patient to queue")
  }

  async manualAssignPatient(data: {
    queueId: string
    doctorId: string
    notes?: string
  }): Promise<any> {
    const response = await apiClient.post("/queue/assign-patient", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to assign patient manually")
  }

  async updateQueueStatus(queueId: string, data: {
    status: string
    notes?: string
    completionNotes?: string
  }): Promise<any> {
    const response = await apiClient.put(`/queue/${queueId}/status`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update queue status")
  }

  async getAvailableDoctors(params?: {
    specialization?: string
    includeCapacity?: boolean
  }): Promise<any> {
    const response = await apiClient.get("/queue/available-doctors", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get available doctors")
  }

  async updateDoctorCapacity(data: {
    isOnline?: boolean
    isAvailable?: boolean
    maxPatients?: number
    averageConsultationTime?: number
    workingHours?: {
      start: string
      end: string
    }
    availabilityStatus?: string
    notes?: string
  }): Promise<any> {
    const response = await apiClient.put("/queue/doctor-capacity", data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update doctor capacity")
  }
}

export const doctorService = new DoctorService()
