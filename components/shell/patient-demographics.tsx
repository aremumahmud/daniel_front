import type { Patient } from "@/lib/types/clinic"

function ageFrom(dob?: string) {
  if (!dob) return undefined
  const d = new Date(dob)
  if (isNaN(d.getTime())) return undefined
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

/**
 * Compact clinic-file demographic grid. Only renders the fields that are
 * present, so it stays useful for both fully-populated and minimal records.
 * Shared by the student/staff health record and the doctor consultation header.
 */
export function PatientDemographics({
  patient,
  variant = "full",
}: {
  patient: Patient
  variant?: "full" | "clinical"
}) {
  const age = ageFrom(patient.dateOfBirth)

  const full: [string, React.ReactNode][] = [
    ["Date of birth", patient.dateOfBirth && `${new Date(patient.dateOfBirth).toLocaleDateString()}${age != null ? ` (${age})` : ""}`],
    ["Sex", patient.sex],
    ["Blood group", patient.bloodGroup],
    ["Genotype", patient.genotype],
    ["Height", patient.height != null ? `${patient.height} cm` : undefined],
    ["Weight", patient.weight != null ? `${patient.weight} kg` : undefined],
    ["Allergies", patient.allergies],
    ["Chronic conditions", patient.chronicConditions],
    ["Emergency contact", patient.emergencyContactName],
    ["Contact phone", patient.emergencyContactPhone],
    ["State of origin", patient.stateOfOrigin],
    ["Nationality", patient.nationality],
  ]

  // Doctor header wants the clinically-relevant subset up front.
  const clinical: [string, React.ReactNode][] = [
    ["Blood group", patient.bloodGroup],
    ["Genotype", patient.genotype],
    ["Allergies", patient.allergies],
    ["Chronic conditions", patient.chronicConditions],
    ["Sex", patient.sex],
    ["Date of birth", patient.dateOfBirth && `${new Date(patient.dateOfBirth).toLocaleDateString()}${age != null ? ` (${age})` : ""}`],
  ]

  const rows = (variant === "clinical" ? clinical : full).filter(([, v]) => v)
  if (rows.length === 0) return null

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map(([label, value]) => (
        <div key={label} className="space-y-0.5">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
