// Queue Management Types for University of Ilorin Clinic

export interface QueuedPatient {
  _id: string
  patientId: string
  patientName: string
  patientEmail: string
  priority: "low" | "medium" | "high" | "emergency"
  reason: string
  symptoms?: string
  queuedAt: string
  estimatedWaitTime?: number
  position: number
  status: "waiting" | "assigned" | "in-consultation" | "completed" | "cancelled"
  assignedDoctorId?: string
  assignedAt?: string
  completedAt?: string
}

export interface DoctorCapacity {
  doctorId: string
  doctorName: string
  specialization: string
  maxPatients: number
  currentPatients: number
  isOnline: boolean
  isAvailable: boolean
  lastAssignedAt?: string
  workingHours: {
    [key: string]: {
      isAvailable: boolean
      startTime: string
      endTime: string
    }
  }
}

export interface QueueStats {
  totalWaiting: number
  totalInConsultation: number
  totalCompleted: number
  averageWaitTime: number
  longestWaitTime: number
  availableDoctors: number
  totalDoctors: number
}

export interface AssignmentResult {
  success: boolean
  patientId: string
  assignedDoctorId?: string
  doctorName?: string
  position?: number
  estimatedWaitTime?: number
  message: string
}

export interface RoundRobinState {
  lastAssignedDoctorIndex: number
  availableDoctors: string[]
  lastUpdated: string
}

// API Request/Response Types
export interface AddToQueueRequest {
  patientId: string
  priority?: "low" | "medium" | "high" | "emergency"
  reason: string
  symptoms?: string
  preferredSpecialization?: string
}

export interface UpdateDoctorCapacityRequest {
  doctorId: string
  maxPatients?: number
  isOnline?: boolean
  isAvailable?: boolean
}

export interface QueueManagementResponse {
  queue: QueuedPatient[]
  stats: QueueStats
  doctorCapacities: DoctorCapacity[]
  roundRobinState: RoundRobinState
}

export interface AssignPatientRequest {
  patientId: string
  doctorId?: string // If not provided, use round-robin
  forceAssign?: boolean // Override capacity limits
}

// Queue Configuration
export interface QueueConfig {
  defaultMaxPatients: number
  emergencyPriorityMultiplier: number
  highPriorityMultiplier: number
  mediumPriorityMultiplier: number
  lowPriorityMultiplier: number
  autoAssignEnabled: boolean
  roundRobinEnabled: boolean
}
