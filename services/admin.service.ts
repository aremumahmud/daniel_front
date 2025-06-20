import { apiClient } from "@/lib/api"
import type { AdminDashboard, AdminAnalytics, User, Appointment } from "@/lib/types/api"

export interface UpdateUserStatusData {
  isActive: boolean
}

export interface AdminProfile {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    role: string
    emailVerified: boolean
    avatarUrl: string
    isActive: boolean
    lastLogin: string
    createdAt: string
    updatedAt: string
  }
  statistics: {
    overview: {
      totalUsers: number
      totalPatients: number
      totalDoctors: number
      totalAdmins: number
    }
    recentActivity: {
      newUsersLast30Days: number
      newPatientsLast30Days: number
    }
  }
  capabilities: {
    canCreateUsers: boolean
    canDeleteUsers: boolean
    canViewAllPatients: boolean
    canManageSystem: boolean
    canAccessAnalytics: boolean
    canManageAdmins: boolean
    canExportData: boolean
    canManageSettings: boolean
  }
  systemInfo: {
    serverUptime: number
    nodeVersion: string
    environment: string
    databaseConnected: boolean
    lastBackup: string | null
  }
  sessionInfo: {
    loginTime: string
    sessionDuration: number
    ipAddress: string
    userAgent: string
  }
}

// Patient Management Types
export interface PatientListItem {
  _id: string
  userId: string
  firstName: string
  lastName: string
  emailAddress: string
  phoneNumber: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  bloodType: string
  admission: {
    department: string
  }
  isActive: boolean
  createdAt: string
}

export interface PatientDetails extends CreatePatientData {
  _id: string
  userId: string
  createdBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientFilters {
  search?: string
  gender?: "male" | "female" | "other"
  bloodType?: string
  department?: string
  isActive?: boolean
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PatientListResponse {
  patients: PatientListItem[]
  pagination: {
    total: number
    limit: number
    offset: number
    pages: number
  }
}

export interface PatientStatistics {
  overview: {
    totalPatients: number
    totalInactivePatients: number
    activePatients: number
  }
  distributions: {
    gender: Array<{ _id: string; count: number }>
    bloodType: Array<{ _id: string; count: number }>
    department: Array<{ _id: string; count: number }>
  }
}

export interface CreateDoctorData {
  // Required Personal Information
  firstName: string
  lastName: string
  email: string
  licenseNumber: string
  specialization: string

  // Optional Personal Information
  phone?: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"

  // Professional Information
  department?: string
  yearsExperience?: number
  education?: string
  bio?: string
  consultationFee?: number
  languages?: string[]
  isAvailable?: boolean

  // Certifications
  certifications?: Array<{
    name: string
    issuedBy: string
    issuedDate: string
    expiryDate?: string
  }>

  // Contact Information (optional)
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  // Schedule Information (optional)
  workingHours?: {
    monday?: { start: string; end: string; available: boolean }
    tuesday?: { start: string; end: string; available: boolean }
    wednesday?: { start: string; end: string; available: boolean }
    thursday?: { start: string; end: string; available: boolean }
    friday?: { start: string; end: string; available: boolean }
    saturday?: { start: string; end: string; available: boolean }
    sunday?: { start: string; end: string; available: boolean }
  }
}

export interface DoctorResponse {
  _id: string
  userId: string | {
    firstName: string
    lastName: string
    email: string
    isActive: boolean
  }
  licenseNumber: string
  specialization: string
  department?: string
  yearsExperience?: number
  education?: string
  bio?: string
  consultationFee?: number
  languages?: string[]
  isAvailable?: boolean
  rating?: number
  totalReviews?: number
  certifications?: Array<{
    name: string
    issuedBy: string
    issuedDate: string
    expiryDate?: string
  }>
  createdAt?: Date
  updatedAt?: Date
}

export interface CreatePatientData {
  // Patient Demographics
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  maritalStatus: "single" | "married" | "divorced" | "widowed"
  nationality: string
  languageSpoken: string
  bloodType: "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-"
  religion?: string
  occupation?: string

  // Contact Information
  phoneNumber: string
  emailAddress: string
  homeAddress: string
  emergencyContact: {
    name: string
    phone: string
    relationship: "spouse" | "parent" | "sibling" | "friend" | "other"
  }

  // Insurance & Billing
  insurance: {
    provider: string
    policyNumber: string
    paymentType: "insurance" | "cash" | "creditCard" | "other"
    billingAddress?: string
  }

  // Medical History
  medicalHistory: {
    chronicIllnesses: string[]
    allergies: string[]
    pastSurgeries: string[]
    currentMedications: string[]
    familyHistory: string
    smokingStatus: "never" | "formerSmoker" | "currentSmoker"
    alcoholConsumption: "none" | "occasional" | "frequent"
    vaccinationHistory: string
  }

  // Admission & Visits
  admission: {
    dateOfAdmission: string
    doctorAssigned: string
    department: "cardiology" | "neurology" | "pediatrics" | "other"
    symptomsComplaints: string
    provisionalDiagnosis: string
    labTestsOrdered: string[]
    medicationsPrescribed: string
    proceduresPerformed: string[]
    treatmentPlan: string
    followUpDate?: string
  }

  // Vital Signs
  vitalSigns: {
    temperature: number
    bloodPressure: string
    heartRate: number
    respiratoryRate: number
    oxygenSaturation: number
    weight: number
    height: number
  }

  // Test Results (optional)
  testResults?: Array<{
    testName: string
    testDate: string
    testResult: string
    doctorComments: string
  }>

  // Discharge Summary (optional)
  dischargeSummary?: {
    dischargeDate?: string
    finalDiagnosis?: string
    medicationsForHome?: string
    dischargeInstructions?: string
    nextFollowUp?: string
  }

  // Digital Documents (optional)
  documents?: {
    scannedIdCard?: string
    labTestReports?: string[]
    imagingReports?: string[]
  }
}

class AdminService {
  async getAdminProfile(): Promise<AdminProfile> {
    console.log("AdminService.getAdminProfile() called - requesting /auth/admin/me")
    const response = await apiClient.get<AdminProfile>("/auth/admin/me")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get admin profile data")
  }

  async getDashboard(): Promise<AdminDashboard> {
    console.log("AdminService.getDashboard() called - requesting /admin/dashboard")
    const response = await apiClient.get<AdminDashboard>("/admin/dashboard")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get dashboard data")
  }

  // Patient Management Methods
  async getPatients(filters: PatientFilters = {}): Promise<PatientListResponse> {
    console.log("AdminService.getPatients() called with filters:", filters)

    // Build query parameters
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    const endpoint = `/admin/patients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.get<PatientListResponse>(endpoint)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get patients")
  }

  async getPatientById(patientId: string): Promise<PatientDetails> {
    console.log("AdminService.getPatientById() called with ID:", patientId)
    const response = await apiClient.get<{ patient: PatientDetails }>(`/admin/patients/${patientId}`)

    if (response.success && response.data && response.data.patient) {
      return response.data.patient
    }

    throw new Error(response.message || "Failed to get patient details")
  }

  async getPatientStatistics(): Promise<PatientStatistics> {
    console.log("AdminService.getPatientStatistics() called")
    const response = await apiClient.get<PatientStatistics>("/admin/patients/statistics")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get patient statistics")
  }

  async createPatient(patientData: CreatePatientData): Promise<{ patient: PatientDetails; credentials: any }> {
    console.log("AdminService.createPatient() called")
    const response = await apiClient.post<{ patient: PatientDetails; credentials: any }>("/admin/patients", patientData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create patient")
  }

  async updatePatient(patientId: string, patientData: Partial<CreatePatientData>): Promise<PatientDetails> {
    console.log("AdminService.updatePatient() called with ID:", patientId)
    const response = await apiClient.put<{ patient: PatientDetails }>(`/admin/patients/${patientId}`, patientData)

    if (response.success && response.data && response.data.patient) {
      return response.data.patient
    }

    throw new Error(response.message || "Failed to update patient")
  }

  async deletePatient(patientId: string): Promise<void> {
    console.log("AdminService.deletePatient() called with ID:", patientId)
    const response = await apiClient.delete(`/admin/patients/${patientId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete patient")
    }
  }

  // Doctor Management Methods
  async createDoctor(doctorData: CreateDoctorData): Promise<{
    doctor: DoctorResponse;
    credentials: { username: string; password: string; email: string }
  }> {
    console.log("AdminService.createDoctor() called")
    const response = await apiClient.post<{
      doctor: DoctorResponse;
      credentials: { username: string; password: string; email: string }
    }>("/admin/doctors", doctorData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to create doctor")
  }

  async getDoctors(params?: {
    page?: number
    limit?: number
    search?: string
    specialization?: string
    department?: string
    isAvailable?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<{
    doctors: DoctorResponse[];
    pagination: {
      currentPage: number
      totalPages: number
      totalDoctors: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }> {
    console.log("AdminService.getDoctors() called with params:", params)

    // The apiClient.get() method now automatically filters out undefined values
    const response = await apiClient.get("/admin/doctors", params)

    if (response.success && response.data) {
      return response.data as {
        doctors: DoctorResponse[];
        pagination: {
          currentPage: number
          totalPages: number
          totalDoctors: number
          hasNextPage: boolean
          hasPrevPage: boolean
        }
      }
    }

    throw new Error(response.message || "Failed to get doctors")
  }

  async getDoctorById(doctorId: string): Promise<DoctorResponse> {
    console.log("AdminService.getDoctorById() called with ID:", doctorId)
    const response = await apiClient.get<{ doctor: DoctorResponse }>(`/admin/doctors/${doctorId}`)

    if (response.success && response.data && response.data.doctor) {
      return response.data.doctor
    }

    throw new Error(response.message || "Failed to get doctor details")
  }

  async updateDoctor(doctorId: string, doctorData: Partial<CreateDoctorData>): Promise<DoctorResponse> {
    console.log("AdminService.updateDoctor() called with ID:", doctorId)
    const response = await apiClient.put<{ doctor: DoctorResponse }>(`/admin/doctors/${doctorId}`, doctorData)

    if (response.success && response.data && response.data.doctor) {
      return response.data.doctor
    }

    throw new Error(response.message || "Failed to update doctor")
  }

  async deleteDoctor(doctorId: string): Promise<void> {
    console.log("AdminService.deleteDoctor() called with ID:", doctorId)
    const response = await apiClient.delete(`/admin/doctors/${doctorId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete doctor")
    }
  }

  // Enhanced Analytics Methods
  async getAnalytics(params?: {
    period?: "day" | "week" | "month" | "year"
  }): Promise<AdminAnalytics> {
    console.log("AdminService.getAnalytics() called with params:", params)
    const response = await apiClient.get<AdminAnalytics>("/admin/analytics", params)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get analytics")
  }

  // Admin Overview Dashboard - matches /api/admin/overview
  async getAdminOverview(): Promise<{
    quickStats: {
      totalUsers: number
      totalPatients: number
      totalDoctors: number
      newUsersToday: number
      newPatientsToday: number
    }
    systemHealth: {
      status: string
      uptime: number
      memoryUsage: any
      cpuUsage: any
      nodeVersion: string
      environment: string
    }
    recentActivity: {
      users: any[]
      patients: any[]
    }
    lastUpdated: string
  }> {
    console.log("AdminService.getAdminOverview() called")
    const response = await apiClient.get("/admin/overview")

    if (response.success && response.data) {
      return response.data as any
    }

    throw new Error(response.message || "Failed to get admin overview")
  }

  // Legacy method - keeping for backward compatibility
  async getSystemOverview(): Promise<{
    totalUsers: number
    totalPatients: number
    totalDoctors: number
    totalAdmins: number
    activeUsers: number
    newUsersLast30Days: number
    systemHealth: {
      uptime: number
      responseTime: number
      errorRate: number
    }
  }> {
    console.log("AdminService.getSystemOverview() called - using getAdminOverview")
    const overview = await this.getAdminOverview()

    // Transform new format to legacy format
    return {
      totalUsers: overview.quickStats.totalUsers,
      totalPatients: overview.quickStats.totalPatients,
      totalDoctors: overview.quickStats.totalDoctors,
      totalAdmins: 0, // Not provided in new API
      activeUsers: overview.quickStats.totalUsers, // Approximation
      newUsersLast30Days: overview.quickStats.newUsersToday * 30, // Approximation
      systemHealth: {
        uptime: overview.systemHealth.uptime,
        responseTime: 0, // Not provided in this format
        errorRate: 0 // Not provided in this format
      }
    }
  }

  async getRealtimeMetrics(): Promise<{
    recentActivity: {
      newUsersLast5Min: number
      newPatientsLast5Min: number
      newUsersLastHour: number
      newPatientsLastHour: number
    }
    systemMetrics: {
      timestamp: string
      uptime: number
      memoryUsage: any
      cpuUsage: any
      loadAverage: number[]
      freeMemory: number
      totalMemory: number
    }
    dbStatus: {
      connected: boolean
      responseTime: number
    }
    timestamp: string
    // Legacy fields for backward compatibility
    activeUsers?: number
    onlineUsers?: number
    currentAppointments?: number
    systemLoad?: number
    responseTime?: number
  }> {
    console.log("AdminService.getRealtimeMetrics() called")
    const response = await apiClient.get("/admin/metrics/realtime")

    if (response.success && response.data) {
      return response.data as any
    }

    throw new Error(response.message || "Failed to get realtime metrics")
  }

  async getAppointmentAnalytics(params?: {
    period?: "day" | "week" | "month" | "year"
    startDate?: string
    endDate?: string
  }): Promise<{
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    pendingAppointments: number
    monthlyTrends: Array<{
      month: string
      scheduled: number
      completed: number
      cancelled: number
    }>
    departmentBreakdown: Array<{
      department: string
      count: number
      percentage: number
    }>
  }> {
    console.log("AdminService.getAppointmentAnalytics() called with params:", params)
    const response = await apiClient.get("/admin/analytics/appointments", params)

    if (response.success && response.data) {
      return response.data as any
    }

    throw new Error(response.message || "Failed to get appointment analytics")
  }

  async getUserAnalytics(params?: {
    period?: "day" | "week" | "month" | "year"
  }): Promise<{
    period: string
    dateRange: {
      startDate: string
      endDate: string
    }
    overview: {
      totalUsers: number
      totalPatients: number
      totalDoctors: number
      totalAdmins: number
      activeUsers: number
      inactiveUsers: number
      verifiedUsers: number
      unverifiedUsers: number
    }
    newRegistrations: {
      total: number
      patients: number
      doctors: number
      period: string
    }
    userGrowth: Array<{
      _id: { year: number; month: number; day?: number }
      count: number
      patients: number
      doctors: number
    }>
    activityMetrics: {
      activeUsersLast30Days: number
      inactiveUsers: number
      verificationRate: string
    }
  }> {
    console.log("AdminService.getUserAnalytics() called with params:", params)
    const response = await apiClient.get("/admin/analytics/users", params)

    if (response.success && response.data) {
      return response.data as any
    }

    throw new Error(response.message || "Failed to get user analytics")
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    timestamp: string
    systemInfo: {
      platform: string
      architecture: string
      nodeVersion: string
      environment: string
      uptime: {
        seconds: number
        formatted: string
      }
    }
    memoryMetrics: {
      rss: number
      heapUsed: number
      heapTotal: number
      external: number
      systemFree: number
      systemTotal: number
    }
    cpuMetrics: {
      user: number
      system: number
      loadAverage: number[]
      cpuCount: number
    }
    healthChecks: {
      database: {
        status: string
        responseTime: string
      }
      memory: {
        status: string
        usage: string
      }
      uptime: {
        status: string
        value: string
      }
    }
    // Legacy fields for backward compatibility
    uptime?: number
    responseTime?: number
    errorRate?: number
    databaseStatus?: "connected" | "disconnected" | "slow"
    serverLoad?: number
    memoryUsage?: number
    diskUsage?: number
    lastBackup?: string | null
    activeConnections?: number
  }> {
    console.log("AdminService.getSystemHealth() called")
    const response = await apiClient.get("/admin/system/health")

    if (response.success && response.data) {
      return response.data as any
    }

    throw new Error(response.message || "Failed to get system health")
  }

  async getUsers(params?: {
    role?: "patient" | "doctor" | "admin"
    status?: "active" | "inactive"
    search?: string
    limit?: number
    page?: number
  }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    console.log("AdminService.getUsers() called with params:", params)

    // The apiClient.get() method now automatically filters out undefined values
    const response = await apiClient.get("/admin/users", params)

    if (response.success && response.data) {
      return response.data as { users: User[]; total: number; page: number; totalPages: number }
    }

    throw new Error(response.message || "Failed to get users")
  }

  async getUserDetails(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/admin/users/${userId}`)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get user details")
  }

  async updateUserStatus(userId: string, data: UpdateUserStatusData): Promise<User> {
    const response = await apiClient.put<User>(`/admin/users/${userId}/status`, data)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update user status")
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete(`/admin/users/${userId}`)

    if (!response.success) {
      throw new Error(response.message || "Failed to delete user")
    }
  }

  async getAppointments(params?: {
    status?: string
    date?: string
    limit?: number
    page?: number
  }): Promise<{ appointments: Appointment[]; total: number; page: number; totalPages: number }> {
    console.log("AdminService.getAppointments() called with params:", params)

    // The apiClient.get() method now automatically filters out undefined values
    const response = await apiClient.get("/admin/appointments", params)

    if (response.success && response.data) {
      return response.data as { appointments: Appointment[]; total: number; page: number; totalPages: number }
    }

    throw new Error(response.message || "Failed to get appointments")
  }


}

export const adminService = new AdminService()
