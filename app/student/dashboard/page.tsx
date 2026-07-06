"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { usePolling } from "@/hooks/use-polling"
import { getStudentProfile } from "@/services/clinic.service"

// Student Portal — FR-18 (secure, self-only view of demographic + clinical
// data). Renamed from app/patient/dashboard. Calls a single aggregated
// endpoint (GET /students/me) which the Lambda scopes strictly to the
// caller's own custom:matricNumber Cognito attribute — a student can never
// pass in someone else's matric number, unlike the old generic
// /patients/{matricNumber} route.
export default function StudentDashboardPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "student" })
  const { data: profile, loading } = usePolling(getStudentProfile, 30000)

  if (isLoading || loading) return null

  if (!profile) {
    return <div className="max-w-3xl mx-auto p-6">No record found for your account.</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">My Health Record</h1>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          <div><strong>Name:</strong> {profile.patient.name}</div>
          <div><strong>Matric No.:</strong> {profile.patient.matricNumber}</div>
          <div><strong>Department:</strong> {profile.patient.department}</div>
          <div><strong>Email:</strong> {profile.patient.email}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Consultation History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Diagnosis</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.encounters.map((e) => (
                <TableRow key={e.encounterId}>
                  <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{e.doctorName}</TableCell>
                  <TableCell>{e.diagnosis}</TableCell>
                </TableRow>
              ))}
              {profile.encounters.length === 0 && (
                <TableRow><TableCell colSpan={3}>No consultations yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Prescriptions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Medication</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.prescriptions.map((p) => (
                <TableRow key={p.prescriptionId}>
                  <TableCell>{p.medication}</TableCell>
                  <TableCell>{p.dosage} · {p.frequency}</TableCell>
                  <TableCell><Badge>{p.status}</Badge></TableCell>
                </TableRow>
              ))}
              {profile.prescriptions.length === 0 && (
                <TableRow><TableCell colSpan={3}>No prescriptions yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Appointments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.appointments.map((a) => (
                <TableRow key={a.appointmentId}>
                  <TableCell>{new Date(a.appointmentDate).toLocaleString()}</TableCell>
                  <TableCell>{a.reason}</TableCell>
                  <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
                </TableRow>
              ))}
              {profile.appointments.length === 0 && (
                <TableRow><TableCell colSpan={3}>No appointments scheduled.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
