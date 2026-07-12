import type { Medication, Prescription } from "@/lib/types/clinic"

/**
 * Normalizes a prescription to a list of medications, transparently handling
 * both the new multi-drug shape (a `medications` JSON string) and legacy
 * single-drug records (flat medication/dosage/frequency fields).
 */
export function prescriptionMedications(p: Prescription): Medication[] {
  if (p.medications) {
    try {
      const parsed = JSON.parse(p.medications)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m) => ({
          medication: m.medication ?? "",
          dosage: m.dosage ?? "",
          frequency: m.frequency ?? "",
        }))
      }
    } catch {
      /* fall through to legacy fields */
    }
  }
  if (p.medication) {
    return [{ medication: p.medication, dosage: p.dosage ?? "", frequency: p.frequency ?? "" }]
  }
  return []
}

/** Short one-line summary, e.g. "Coartem +2 more" or "Amoxicillin". */
export function prescriptionSummary(p: Prescription): string {
  const meds = prescriptionMedications(p)
  if (meds.length === 0) return "—"
  if (meds.length === 1) return meds[0].medication
  return `${meds[0].medication} +${meds.length - 1} more`
}
