// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: "admin" | "doctor" | "patient"
    emailVerified: boolean
    avatarUrl: string | null
  }
}

// User Types
export interface User {
  _id: string
  id?: string // API sometimes returns id instead of _id
  email: string
  role: "admin" | "doctor" | "patient"
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  fullName: string
  // Additional fields from profile API
  dateOfBirth?: string
  gender?: "male" | "female" | "other" | "prefer_not_to_say"
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  allergies?: string[]
  medicalHistory?: string[]
}

// Patient Types
export interface EmergencyContact {
  name: string
  relationship: string
  phoneMain: string
  phoneSecondary?: string
  email?: string
  isPrimary: boolean
  canMakeDecisions?: boolean
}

export interface Allergy {
  allergen: string
  severity: "mild" | "moderate" | "severe"
  reaction: string
  notes?: string
}

export interface ChronicCondition {
  condition: string
  diagnosedDate: Date
  status: "active" | "managed" | "resolved"
  notes?: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  prescribedBy: string
  startDate: Date
  endDate?: Date
  purpose: string
}

export interface VitalSigns {
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  oxygenSaturation?: number
}

export interface Patient {
  _id: string
  userId: {
    _id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    phone?: string
    avatarUrl?: string
    role: string
    emailVerified: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  dateOfBirth: string
  age: number
  gender: "male" | "female" | "other" | "prefer_not_to_say"
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  height?: {
    value: number
    unit: "cm" | "ft"
  }
  weight?: {
    value: number
    unit: "kg" | "lbs"
  }
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  insurance?: {
    provider: string
    policyNumber: string
    groupNumber: string
  }
  primaryDoctorId?: string
  allergies?: string[]
  chronicConditions?: string[]
  currentMedications?: Medication[]
  lastVisit?: string
  isActive: boolean
  bmi?: number
  bmiStatus?: string
  createdAt: string
}

// Doctor Types
export interface Doctor {
  _id: string
  userId: {
    _id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    phone?: string
    avatarUrl?: string
    role: string
    emailVerified: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  specialization: string
  licenseNumber: string
  experience: number
  education: Array<{
    degree: string
    institution: string
    year: number
  }>
  certifications: string[]
  workingHours: {
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
  consultationFee: number
  rating: number
  totalReviews: number
  isAvailable: boolean
  joinedAt: string
}

// Appointment Types
export interface Appointment {
  _id: string
  patientId: {
    _id: string
    firstName: string
    lastName: string
    middleName?: string
    emailAddress: string
    phoneNumber: string
    dateOfBirth: string
    gender: string
    bloodType?: string
    age: number
    userId: {
      _id: string
      email: string
      firstName: string
      lastName: string
      phone: string
      fullName: string
      isLocked: boolean
    }
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
    medicalHistory?: {
      chronicIllnesses: string[]
      allergies: string[]
      pastSurgeries: string[]
      currentMedications: string[]
      familyHistory: string
      smokingStatus: string
      alcoholConsumption: string
    }
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  doctorId: string
  appointmentDate: string
  appointmentTime: string
  durationMinutes: number
  type: "consultation" | "follow-up" | "check-up" | "emergency" | "procedure"
  status: "scheduled" | "confirmed" | "pending" | "cancelled" | "completed" | "no-show"
  reason: string
  priority?: "low" | "medium" | "high" | "urgent"
  location?: string
  symptoms?: string[]
  attachments?: string[]
  notes?: string
  isVirtual?: boolean
  virtualMeetingLink?: string
  followUpRequired?: boolean
  followUpDate?: string
  createdAt: string
  updatedAt: string
  appointmentDateTime: string
  appointmentEndTime: string
  statusDisplay: string
  timeUntilAppointment: string
}

// Medical Record Types
export interface MedicalRecord {
  _id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  recordType: "consultation" | "follow-up" | "check-up" | "emergency" | "lab-result" | "prescription"
  visitDate: Date
  chiefComplaint: string
  diagnosis: string
  treatment: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  vitalSigns: VitalSigns
  notes?: string
  followUpInstructions?: string
  isConfidential: boolean
  createdAt: Date
  updatedAt: Date
}

// Health Metrics Types
export interface HealthMetric {
  _id: string
  patientId: string
  metricType: "blood_pressure" | "heart_rate" | "weight" | "temperature" | "blood_glucose"
  value?: number
  systolicValue?: number
  diastolicValue?: number
  unit: string
  status: "normal" | "high" | "low" | "critical"
  notes?: string
  recordedAt: Date
  createdAt: Date
}

// Notification Types
export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: "appointment" | "lab-result" | "prescription" | "emergency" | "system" | "reminder"
  priority: "low" | "medium" | "high" | "urgent"
  isRead: boolean
  readAt?: Date
  actionUrl?: string
  createdAt: Date
}

// Dashboard Types
export interface PatientDashboard {
  patient: Patient
  upcomingAppointments: Appointment[]
  recentMetrics: HealthMetric[]
  notifications: Notification[]
  healthGoals: any[]
}

export interface DoctorDashboard {
  todaysAppointments: Appointment[]
  pendingAppointments: Appointment[]
  recentPatients: Patient[]
  notifications?: Notification[]
  statistics: {
    totalPatients: number
    todaysAppointments: number
    pendingAppointments: number
    confirmedToday?: number
    pendingToday?: number
    pendingReports?: number
    averageRating?: number
  }
}

export interface AdminDashboard {
  userStats: {
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
  }
  appointmentStats: {
    totalAppointments: number
    completedToday: number
    scheduledToday: number
  }
  recentActivity: any[]
}

export interface AdminAnalytics {
  userStats: {
    totalPatients: number
    totalDoctors: number
    totalAdmins: number
    activeUsers: number
    newUsersThisMonth: number
  }
  appointmentStats: {
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    monthlyAppointments: Array<{
      month: string
      count: number
    }>
  }
  systemUsage: {
    monthlyLogins: Array<{
      month: string
      count: number
    }>
    recordsCreated: Array<{
      month: string
      count: number
    }>
  }
  userDistribution: {
    patients: number
    doctors: number
    admins: number
  }
}
