import { apiClient } from "@/lib/api"
import type {
  QueuedPatient,
  DoctorCapacity,
  QueueStats,
  AssignmentResult,
  RoundRobinState,
  AddToQueueRequest,
  UpdateDoctorCapacityRequest,
  QueueManagementResponse,
  AssignPatientRequest,
  QueueConfig
} from "@/lib/types/queue"

class QueueService {
  // ===== QUEUE MANAGEMENT APIs =====
  
  /**
   * Get current queue status with all patients and doctor capacities
   */
  async getQueueStatus(): Promise<QueueManagementResponse> {
    console.log("QueueService.getQueueStatus() called")
    const response = await apiClient.get<QueueManagementResponse>("/queue/status")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get queue status")
  }

  /**
   * Add a patient to the queue
   */
  async addPatientToQueue(data: AddToQueueRequest): Promise<any> {
    console.log("QueueService.addPatientToQueue() called with:", data)
    const response = await apiClient.post<any>("/queue/add-patient", data)

    // Return the full response object so components can check success/message
    return response
  }

  /**
   * Assign a patient to a doctor (manual or automatic round-robin)
   */
  async assignPatientToDoctor(data: AssignPatientRequest): Promise<any> {
    console.log("QueueService.assignPatientToDoctor() called with:", data)
    const response = await apiClient.post<any>("/queue/assign-patient", data)

    // Return the full response object so components can check success/message
    return response
  }

  /**
   * Remove a patient from the queue
   */
  async removePatientFromQueue(queueId: string, reason?: string): Promise<void> {
    console.log("QueueService.removePatientFromQueue() called with:", queueId)
    const response = await apiClient.delete(`/queue/patient/${queueId}`, {
      reason: reason || "Patient removed from queue"
    })

    if (!response.success) {
      throw new Error(response.message || "Failed to remove patient from queue")
    }
  }

  /**
   * Update patient priority in queue (using status update endpoint)
   */
  async updatePatientPriority(queueId: string, priority: "low" | "medium" | "high" | "emergency"): Promise<QueuedPatient> {
    console.log("QueueService.updatePatientPriority() called with:", queueId, priority)
    const response = await apiClient.put<{ patient: QueuedPatient }>(`/queue/patient/${queueId}/status`, {
      status: "waiting",
      priority: priority,
      notes: `Priority updated to ${priority}`
    })

    if (response.success && response.data) {
      return response.data.patient
    }

    throw new Error(response.message || "Failed to update patient priority")
  }

  // ===== DOCTOR CAPACITY MANAGEMENT APIs =====

  /**
   * Get all doctor capacities and availability
   */
  async getDoctorCapacities(): Promise<DoctorCapacity[]> {
    console.log("QueueService.getDoctorCapacities() called")
    const response = await apiClient.get<DoctorCapacity[]>("/queue/doctors/capacities")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get doctor capacities")
  }

  /**
   * Update doctor capacity and availability
   */
  async updateDoctorCapacity(data: UpdateDoctorCapacityRequest): Promise<DoctorCapacity> {
    console.log("QueueService.updateDoctorCapacity() called with:", data)
    const response = await apiClient.put<{ capacity: DoctorCapacity }>(`/queue/doctors/${data.doctorId}/status`, {
      isOnline: data.isOnline,
      isAvailable: data.isAvailable
    })

    if (response.success && response.data) {
      return response.data.capacity
    }

    throw new Error(response.message || "Failed to update doctor capacity")
  }

  /**
   * Set doctor online/offline status
   */
  async setDoctorOnlineStatus(doctorId: string, isOnline: boolean): Promise<DoctorCapacity> {
    console.log("QueueService.setDoctorOnlineStatus() called with:", doctorId, isOnline)
    const response = await apiClient.put<{ capacity: DoctorCapacity }>(`/queue/doctors/${doctorId}/status`, {
      isOnline
    })

    if (response.success && response.data) {
      return response.data.capacity
    }

    throw new Error(response.message || "Failed to update doctor online status")
  }

  // ===== QUEUE STATISTICS AND MONITORING =====

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    console.log("QueueService.getQueueStats() called")
    const response = await apiClient.get<QueueStats>("/queue/analytics")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get queue statistics")
  }

  /**
   * Get round-robin state (using queue analytics)
   */
  async getRoundRobinState(): Promise<RoundRobinState> {
    console.log("QueueService.getRoundRobinState() called")
    const response = await apiClient.get<any>("/queue/analytics", { includeDetails: true })

    if (response.success && response.data) {
      // Extract round-robin-like data from analytics
      return {
        currentDoctorIndex: 0,
        doctorRotation: [],
        lastAssignedAt: new Date().toISOString(),
        totalAssignments: response.data.totalAssignments || 0
      }
    }

    throw new Error(response.message || "Failed to get round-robin state")
  }

  /**
   * Reset round-robin state (not available in current API)
   */
  async resetRoundRobin(): Promise<RoundRobinState> {
    console.log("QueueService.resetRoundRobin() called - using mock data")
    // Since this endpoint doesn't exist, return mock data
    return {
      currentDoctorIndex: 0,
      doctorRotation: [],
      lastAssignedAt: new Date().toISOString(),
      totalAssignments: 0
    }
  }

  // ===== QUEUE CONFIGURATION =====

  /**
   * Get queue configuration
   */
  async getQueueConfig(): Promise<QueueConfig> {
    console.log("QueueService.getQueueConfig() called")
    const response = await apiClient.get<QueueConfig>("/queue/settings")

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to get queue configuration")
  }

  /**
   * Update queue configuration
   */
  async updateQueueConfig(config: Partial<QueueConfig>): Promise<QueueConfig> {
    console.log("QueueService.updateQueueConfig() called with:", config)
    const response = await apiClient.put<QueueConfig>("/queue/settings", config)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || "Failed to update queue configuration")
  }

  // ===== PATIENT CONSULTATION MANAGEMENT =====

  /**
   * Mark patient consultation as started
   */
  async startConsultation(queueId: string): Promise<QueuedPatient> {
    console.log("QueueService.startConsultation() called with:", queueId)
    const response = await apiClient.put<{ patient: QueuedPatient }>(`/queue/patient/${queueId}/status`, {
      status: "in-consultation",
      notes: "Consultation started"
    })

    if (response.success && response.data) {
      return response.data.patient
    }

    throw new Error(response.message || "Failed to start consultation")
  }

  /**
   * Mark patient consultation as completed
   */
  async completeConsultation(queueId: string, notes?: string): Promise<QueuedPatient> {
    console.log("QueueService.completeConsultation() called with:", queueId)
    const response = await apiClient.put<{ patient: QueuedPatient }>(`/queue/patient/${queueId}/status`, {
      status: "completed",
      notes: notes || "Consultation completed"
    })

    if (response.success && response.data) {
      return response.data.patient
    }

    throw new Error(response.message || "Failed to complete consultation")
  }

  // ===== BULK OPERATIONS =====

  /**
   * Auto-assign all waiting patients using round-robin
   */
  async autoAssignWaitingPatients(): Promise<AssignmentResult[]> {
    console.log("QueueService.autoAssignWaitingPatients() called")
    const response = await apiClient.post<{ results: AssignmentResult[] }>("/queue/auto-assign", {
      maxAssignments: 10
    })

    if (response.success && response.data) {
      return response.data.results
    }

    throw new Error(response.message || "Failed to auto-assign waiting patients")
  }

  /**
   * Clear completed consultations from queue (not available in current API)
   */
  async clearCompletedConsultations(): Promise<{ cleared: number }> {
    console.log("QueueService.clearCompletedConsultations() called - endpoint not available")
    // Since this endpoint doesn't exist in the documented API, return mock data
    return { cleared: 0 }
  }
}

export const queueService = new QueueService()
