import { apiClient } from "@/lib/api"
import type {
  Patient,
  PatientHistory,
  StudentProfile,
  QueueEntry,
  DoctorCapacity,
  Appointment,
  AuditLogEntry,
  Prescription,
  PrescriptionStatus,
} from "@/lib/types/clinic"

// Replaces the old role-namespaced service files (admin.service.ts,
// doctor.service.ts, patient.service.ts, queue.service.ts) for the flows
// covered by the AWS Lambda backend. All calls go through /api/clinic/*,
// which proxies to API Gateway (see app/api/clinic/_lib/proxy.ts).
// See MIGRATION_NOTES.md for what from the old services is NOT covered here.
//
// IMPORTANT: apiClient.request returns the parsed HTTP body directly, and
// the Lambdas return their payload UNWRAPPED (e.g. `{ items: [...] }` or the
// object itself) — there is no `{ success, data }` envelope. So we read the
// body's own fields here, not a `.data` wrapper. `apiClient` still types the
// return as ApiResponse<T>, hence the `as unknown as` casts.

const BASE = "/clinic"

type Items<T> = { items?: T[] }

// --- Receptionist ---

export async function searchPatients(query: string) {
  const res = (await apiClient.get(`${BASE}/patients`, { query })) as unknown as Items<Patient>
  return res.items ?? []
}

export async function registerPatient(input: { matricNumber: string; name: string; email: string; department: string }) {
  return apiClient.post(`${BASE}/patients`, input)
}

export async function getPatient(matricNumber: string) {
  // Matric numbers contain "/" (e.g. "21/52HL001"); API Gateway decodes
  // %2F back into a literal "/" before route matching, which breaks a
  // path-parameter route, so this hits GET /patient?matricNumber= instead
  // of GET /patients/{matricNumber} — see AWS_INFRA_SETUP.md §7.
  const res = await apiClient.get(`${BASE}/patient`, { matricNumber })
  return res as unknown as Patient
}

export async function getPatientHistory(matricNumber: string) {
  const res = await apiClient.get(`${BASE}/patient/history`, { matricNumber })
  return res as unknown as PatientHistory
}

export async function addToQueue(input: { matricNumber: string; patientName: string; priority?: "NORMAL" | "URGENT"; doctorId?: string; doctorName?: string }) {
  return apiClient.post(`${BASE}/queue`, input)
}

export async function assignDoctorToQueueEntry(queueId: string, input: { doctorId: string; doctorName?: string }) {
  return apiClient.post(`${BASE}/queue/${encodeURIComponent(queueId)}/assign`, input)
}

export async function listDoctorCapacity() {
  const res = (await apiClient.get(`${BASE}/doctors/capacity`)) as unknown as Items<DoctorCapacity>
  return res.items ?? []
}

export async function createAppointment(input: { matricNumber: string; appointmentDate: string; reason?: string }) {
  return apiClient.post(`${BASE}/appointments`, input)
}

export async function listAppointments(matricNumber?: string) {
  const res = (await apiClient.get(`${BASE}/appointments`, { matricNumber })) as unknown as Items<Appointment>
  return res.items ?? []
}

export async function getAuditLog(matricNumber?: string) {
  const res = (await apiClient.get(`${BASE}/audit`, { matricNumber })) as unknown as Items<AuditLogEntry>
  return res.items ?? []
}

// --- Doctor ---

export async function getQueue(params: { status?: string; doctorId?: string } = {}) {
  const res = (await apiClient.get(`${BASE}/queue`, params)) as unknown as Items<QueueEntry>
  return res.items ?? []
}

export async function callNextPatient() {
  const res = await apiClient.put(`${BASE}/queue/call-next`)
  return res as unknown as QueueEntry
}

export async function completeQueueEntry(queueId: string) {
  return apiClient.put(`${BASE}/queue/${encodeURIComponent(queueId)}/complete`)
}

export async function updateDoctorCapacity(input: { status: "ONLINE" | "OFFLINE"; doctorName?: string; maxCapacity?: number }) {
  return apiClient.put(`${BASE}/doctors/capacity`, input)
}

export async function createEncounter(input: { matricNumber: string; doctorName: string; diagnosis: string; notes: string }) {
  return apiClient.post(`${BASE}/encounters`, input)
}

export async function createPrescription(input: {
  matricNumber: string
  studentName: string
  studentEmail: string
  medication: string
  dosage: string
  frequency: string
  doctorName: string
}) {
  return apiClient.post(`${BASE}/prescriptions`, input)
}

// --- Pharmacist ---

export async function getPharmacyAlerts(status: PrescriptionStatus = "PENDING") {
  const res = (await apiClient.get(`${BASE}/prescriptions`, { status })) as unknown as Items<Prescription>
  return res.items ?? []
}

export async function getPrescriptionsByMatric(matricNumber: string) {
  const res = (await apiClient.get(`${BASE}/prescriptions/lookup`, { matricNumber })) as unknown as Items<Prescription>
  return res.items ?? []
}

export async function updatePrescriptionStatus(input: { prescriptionId: string; matricNumber: string; status: PrescriptionStatus }) {
  return apiClient.put(`${BASE}/prescriptions/status`, input)
}

// --- Student ---

export async function getStudentProfile() {
  const res = await apiClient.get(`${BASE}/students/me`)
  return res as unknown as StudentProfile
}
