"use client"

import { CalendarDays, FileText, HeartPulse, Pill } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { AppShell } from "@/components/shell/app-shell"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { StatCard } from "@/components/shell/stat-card"
import { StatusBadge } from "@/components/shell/status-badge"
import { TableSkeleton } from "@/components/shell/table-skeleton"
import { PatientDemographics } from "@/components/shell/patient-demographics"

import { useAuthGuard } from "@/hooks/use-auth-guard"
import { usePolling } from "@/hooks/use-polling"
import { getStudentProfile } from "@/services/clinic.service"
import { prescriptionMedications } from "@/lib/prescriptions"

export default function StudentDashboardPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "student" })
  const { data: profile, loading, error } = usePolling(getStudentProfile, 30000)

  if (isLoading) return null

  const encounters = (profile?.encounters ?? []).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const prescriptions = (profile?.prescriptions ?? [])
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const appointments = (profile?.appointments ?? [])
    .slice()
    .sort((a, b) => (b.appointmentDate ?? "").localeCompare(a.appointmentDate ?? ""))
  const pendingRx = prescriptions.filter((p) => p.status === "PENDING").length

  return (
    <AppShell title="My Health Record">
      <div className="space-y-8">
        <PageHeader
          title="My Health Record"
          description="Your visits, prescriptions and appointments at the university clinic."
        />

        {error && !profile ? (
          <Card className="rounded-lg shadow-sm">
            <CardContent>
              <EmptyState
                icon={HeartPulse}
                title="We couldn't load your record"
                description="Please refresh the page, or contact the clinic front desk if this keeps happening."
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile summary */}
            <Card className="rounded-lg shadow-sm">
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-72" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="space-y-1">
                        <p className="text-lg font-semibold tracking-tight">{profile?.patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {profile?.patient.matricNumber} &middot; {profile?.patient.department} &middot;{" "}
                          {profile?.patient.email}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registered{" "}
                        {profile?.patient.createdAt && new Date(profile.patient.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {profile?.patient && <PatientDemographics patient={profile.patient} />}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Consultations" value={encounters.length} icon={FileText} loading={loading} />
              <StatCard
                label="Prescriptions"
                value={prescriptions.length}
                hint={pendingRx > 0 ? `${pendingRx} ready for pickup` : undefined}
                icon={Pill}
                loading={loading}
              />
              <StatCard label="Appointments" value={appointments.length} icon={CalendarDays} loading={loading} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Consultations */}
              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Consultation history</CardTitle>
                  <CardDescription>Diagnoses recorded by clinic doctors.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <TableSkeleton rows={3} cols={2} />
                  ) : encounters.length === 0 ? (
                    <EmptyState icon={FileText} title="No consultations yet" />
                  ) : (
                    <div className="space-y-3">
                      {encounters.map((e) => (
                        <div key={e.encounterId} className="rounded-lg border p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{e.diagnosis}</p>
                            <p className="shrink-0 text-xs text-muted-foreground">
                              {new Date(e.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {e.notes && <p className="mt-1 text-sm text-muted-foreground">{e.notes}</p>}
                          <p className="mt-2 text-xs text-muted-foreground">{e.doctorName}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Prescriptions</CardTitle>
                  <CardDescription>Show your matriculation number at the pharmacy to collect.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <TableSkeleton rows={3} cols={3} />
                  ) : prescriptions.length === 0 ? (
                    <EmptyState icon={Pill} title="No prescriptions yet" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescriptions.map((p) => (
                          <TableRow key={p.prescriptionId}>
                            <TableCell>
                              <ul className="space-y-0.5">
                                {prescriptionMedications(p).map((m, i) => (
                                  <li key={i}>
                                    <span className="font-medium">{m.medication}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {" "}
                                      — {m.dosage}, {m.frequency}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={p.status} />
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Appointments */}
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Appointments</CardTitle>
                <CardDescription>Scheduled by the clinic front desk.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton rows={2} cols={3} />
                ) : appointments.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="No appointments scheduled"
                    description="Contact the front desk to book one."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="hidden sm:table-cell">Reason</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((a) => (
                        <TableRow key={a.appointmentId}>
                          <TableCell className="text-sm">
                            {new Date(a.appointmentDate).toLocaleString()}
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                            {a.reason || "—"}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={a.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  )
}
