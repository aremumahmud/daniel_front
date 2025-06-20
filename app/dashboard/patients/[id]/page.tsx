"use client"

import { PatientDetails } from "@/components/patient-details"

interface PatientPageProps {
  params: {
    id: string
  }
}

export default function PatientPage({ params }: PatientPageProps) {
  return (
    <div className="container mx-auto p-6">
      <PatientDetails patientId={params.id} />
    </div>
  )
}
