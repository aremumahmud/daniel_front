// Flat, matricNumber-keyed types matching the AWS Lambda responses in
// /LAMBDA_FUNCTIONS.js — no Mongo-style _id/nested-userId here, since the
// backend is DynamoDB. See MIGRATION_NOTES.md for the endpoint-by-endpoint
// mapping this replaces.

export interface Patient {
  matricNumber: string
  name: string
  email: string
  department: string
  createdAt: string
  // Optional demographic profile (added later; older records may omit these).
  dateOfBirth?: string
  sex?: string
  bloodGroup?: string
  genotype?: string
  height?: number
  weight?: number
  allergies?: string
  chronicConditions?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  stateOfOrigin?: string
  nationality?: string
}

export interface Encounter {
  encounterId: string
  matricNumber: string
  doctorName: string
  diagnosis: string
  notes: string
  createdAt: string
}

export type PrescriptionStatus = "PENDING" | "COLLECTED" | "REJECTED"

export interface Medication {
  medication: string
  dosage: string
  frequency: string
}

export interface Prescription {
  prescriptionId: string
  matricNumber: string
  // New multi-drug records carry `medications` (a JSON string of Medication[]);
  // older records only have the flat medication/dosage/frequency fields.
  // Use `prescriptionMedications()` in lib/prescriptions.ts to read either.
  medications?: string
  medication?: string
  dosage?: string
  frequency?: string
  doctorName: string
  status: PrescriptionStatus
  createdAt: string
  updatedAt?: string
}

export interface PatientHistory {
  encounters: Encounter[]
  prescriptions: Prescription[]
}

export interface StudentProfile {
  patient: Patient
  encounters: Encounter[]
  prescriptions: Prescription[]
  appointments: Appointment[]
}

export type QueueStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED"
export type QueuePriority = "NORMAL" | "URGENT"

export interface QueueEntry {
  queueId: string
  matricNumber: string
  patientName: string
  status: QueueStatus
  priority: QueuePriority
  assignedDoctorId?: string
  assignedDoctorName?: string
  createdAt: string
  createdBy?: string
  calledAt?: string
  completedAt?: string
}

export type DoctorAvailability = "OFFLINE" | "ONLINE" | "AT_CAPACITY"

export interface DoctorCapacity {
  doctorId: string
  doctorName: string
  status: DoctorAvailability
  currentLoad: number
  maxCapacity: number
  updatedAt: string
}

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED"

export interface Appointment {
  appointmentId: string
  matricNumber: string
  appointmentDate: string
  reason?: string
  status: AppointmentStatus
  createdAt: string
}

export interface AuditLogEntry {
  logId: string
  matricNumber: string
  action: string
  performedBy: string
  performedByRole: string
  timestamp: string
  details?: string
}
