import { apiClient } from './api-client'

// Types based on the comprehensive medical records schema
export interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number }
  heartRate: number
  temperature: number
  respiratoryRate: number
  oxygenSaturation: number
  weight: number
  height: number
  bmi: number
  painScale: number
}

export interface Diagnosis {
  primary: {
    condition: string
    icdCode: string
    severity: 'mild' | 'moderate' | 'severe'
    onset: string
    status: 'active' | 'resolved' | 'chronic'
  }
  secondary: Array<{
    condition: string
    icdCode: string
    severity: string
    status: string
  }>
  differential: Array<{
    condition: string
    probability: string
    notes: string
  }>
}

export interface Medication {
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  route: 'oral' | 'iv' | 'im' | 'topical' | 'inhaled' | 'sublingual' | 'rectal'
  instructions: string
  refills: number
  quantity: string
  genericAllowed: boolean
}

export interface TreatmentPlan {
  medications: Medication[]
  procedures: Array<{
    procedureName: string
    cptCode: string
    scheduledDate: string
    urgency: 'routine' | 'urgent' | 'emergent'
    instructions: string
    location: string
  }>
  therapies: Array<{
    therapyType: string
    frequency: string
    duration: string
    instructions: string
    referralRequired: boolean
  }>
}

export interface LabResult {
  testName: string
  testCode: string
  result: string
  normalRange: string
  unit: string
  abnormal: boolean
  criticalValue: boolean
  testDate: string
  labFacility: string
  notes: string
}

export interface FollowUp {
  required: boolean
  timeframe: string
  type: 'office' | 'phone' | 'telehealth' | 'lab-only'
  instructions: string
  scheduledDate: string | null
}

export interface DoctorNotes {
  assessment: string
  plan: string
  patientEducation: string
  warningsSigns: string
  additionalNotes: string
}

export interface MedicalRecord {
  _id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  recordDate: string
  recordType: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'lab-result' | 'prescription' | 'surgery' | 'therapy'
  
  // Clinical Information
  chiefComplaint: string
  historyOfPresentIllness: string
  reviewOfSystems: Record<string, any>
  physicalExamination: Record<string, any>
  
  // Vital Signs and Diagnosis
  vitalSigns: VitalSigns
  diagnosis: Diagnosis
  
  // Treatment and Results
  treatmentPlan: TreatmentPlan
  labResults: LabResult[]
  imagingStudies: Array<any>
  referrals: Array<any>
  
  // Follow-up and Notes
  followUp: FollowUp
  doctorNotes: DoctorNotes
  
  // Attachments and Billing
  attachments: Array<any>
  billing: {
    encounterType: string
    cptCodes: string[]
    icdCodes: string[]
    modifiers: string[]
    levelOfService: '1' | '2' | '3' | '4' | '5'
  }
  
  // Record Management
  status: 'draft' | 'completed' | 'pending-review' | 'reviewed' | 'amended' | 'archived'
  isArchived: boolean
  confidentialityLevel: 'normal' | 'restricted' | 'very-restricted'
  
  // Audit Trail
  amendments: Array<any>
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
  
  // Populated data
  patient?: {
    firstName: string
    lastName: string
    matricNumber: string
  }
  doctor?: {
    firstName: string
    lastName: string
    specialization: string
  }
}

export interface CreateMedicalRecordData {
  patientId: string
  doctorId?: string
  appointmentId?: string
  recordType: string
  chiefComplaint: string
  historyOfPresentIllness?: string
  reviewOfSystems?: Record<string, any>
  physicalExamination?: Record<string, any>
  vitalSigns?: Partial<VitalSigns>
  diagnosis?: Partial<Diagnosis>
  treatmentPlan?: Partial<TreatmentPlan>
  labResults?: LabResult[]
  followUp?: Partial<FollowUp>
  doctorNotes?: Partial<DoctorNotes>
  billing?: any
  status?: string
  confidentialityLevel?: string
}

export interface MedicalRecordsFilters {
  page?: number
  limit?: number
  search?: string
  patientId?: string
  doctorId?: string
  recordType?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface QuickRecordData {
  patientId: string
  appointmentId?: string
  chiefComplaint: string
  quickDiagnosis?: string
  quickTreatment?: string
  followUpDays?: number
  vitalSigns?: Partial<VitalSigns>
  notes?: string
}

export interface PrescriptionData {
  patientId: string
  medications: Array<{
    name: string
    strength: string
    form?: string
    quantity: number
    refills?: number
    instructions: string
    route?: string
    frequency?: string
    duration?: string
    genericAllowed?: boolean
  }>
  sendToPharmacy?: boolean
  pharmacyId?: string
  appointmentId?: string
  diagnosis?: string
  notes?: string
}

class MedicalRecordsService {
  // Admin Medical Records APIs
  async getAdminMedicalRecords(filters: MedicalRecordsFilters = {}) {
    const response = await apiClient.get('/admin/medical-records', filters)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get medical records')
  }

  async createAdminMedicalRecord(data: CreateMedicalRecordData) {
    const response = await apiClient.post('/admin/medical-records', data)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to create medical record')
  }

  async getAdminMedicalRecord(id: string) {
    const response = await apiClient.get(`/admin/medical-records/${id}`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get medical record')
  }

  async updateAdminMedicalRecord(id: string, data: Partial<CreateMedicalRecordData>) {
    const response = await apiClient.put(`/admin/medical-records/${id}`, data)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to update medical record')
  }

  async deleteAdminMedicalRecord(id: string) {
    const response = await apiClient.delete(`/admin/medical-records/${id}`)
    
    if (response.success) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to delete medical record')
  }

  async bulkCreateMedicalRecords(records: CreateMedicalRecordData[]) {
    const response = await apiClient.post('/admin/medical-records/bulk', { records })
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to create medical records in bulk')
  }

  async getMedicalRecordsAnalytics(params: {
    dateRange?: string
    groupBy?: string
    metrics?: string
  } = {}) {
    const response = await apiClient.get('/admin/medical-records/analytics', params)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get medical records analytics')
  }

  // Doctor Medical Records APIs
  async getDoctorMedicalRecords(filters: MedicalRecordsFilters = {}) {
    const response = await apiClient.get('/doctor/medical-records', filters)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get medical records')
  }

  async createDoctorMedicalRecord(data: CreateMedicalRecordData) {
    const response = await apiClient.post('/doctor/medical-records', data)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to create medical record')
  }

  async getDoctorMedicalRecord(id: string) {
    const response = await apiClient.get(`/doctor/medical-records/${id}`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get medical record')
  }

  async updateDoctorMedicalRecord(id: string, data: Partial<CreateMedicalRecordData>) {
    const response = await apiClient.put(`/doctor/medical-records/${id}`, data)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to update medical record')
  }

  async createQuickRecord(data: QuickRecordData) {
    const response = await apiClient.post('/doctor/medical-records/quick', data)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to create quick record')
  }

  async getQuickRecordTemplates() {
    const response = await apiClient.get('/doctor/medical-records/quick')
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get quick record templates')
  }

  async createPrescription(data: PrescriptionData) {
    const response = await apiClient.post('/doctor/medical-records/prescription', data)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to create prescription')
  }

  async getPrescriptionData() {
    const response = await apiClient.get('/doctor/medical-records/prescription')
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get prescription data')
  }

  // Patient Medical Records APIs
  async getPatientMedicalRecords(filters: MedicalRecordsFilters = {}) {
    const response = await apiClient.get('/patient/medical-records', filters)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get medical records')
  }

  async getPatientMedicalRecord(id: string) {
    const response = await apiClient.get(`/patient/medical-records/${id}`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get medical record')
  }
}

export const medicalRecordsService = new MedicalRecordsService()
export default medicalRecordsService
