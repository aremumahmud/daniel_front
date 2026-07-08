"use client"

import type React from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Loader2, Pill } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { AppShell } from "@/components/shell/app-shell"
import { EmptyState } from "@/components/shell/empty-state"
import { StatusBadge } from "@/components/shell/status-badge"
import { TableSkeleton } from "@/components/shell/table-skeleton"
import { PatientDemographics } from "@/components/shell/patient-demographics"

import { useAuth } from "@/hooks/use-auth"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { usePolling } from "@/hooks/use-polling"
import { useToast } from "@/hooks/use-toast"
import { createEncounter, createPrescription, getPatient, getPatientHistory } from "@/services/clinic.service"

export default function ConsultationPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "doctor" })
  const { user } = useAuth()
  const params = useParams<{ matricNumber: string }>()
  // useParams returns the raw (still URL-encoded) segment, and matric
  // numbers contain "/" — decode before using it in API calls.
  const matricNumber = decodeURIComponent(params.matricNumber)
  const router = useRouter()
  const { toast } = useToast()

  const { data: patient, loading: patientLoading } = usePolling(() => getPatient(matricNumber), 60000)
  const { data: history, loading: historyLoading, refetch: refetchHistory } = usePolling(
    () => getPatientHistory(matricNumber),
    60000,
  )

  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [savingEncounter, setSavingEncounter] = useState(false)

  const [rx, setRx] = useState({ medication: "", dosage: "", frequency: "" })
  const [savingRx, setSavingRx] = useState(false)

  if (isLoading) return null

  const handleSaveEncounter = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingEncounter(true)
    try {
      await createEncounter({ matricNumber, doctorName: user?.fullName ?? "Doctor", diagnosis, notes })
      toast({ title: "Encounter saved", description: "Added to the student's clinical file." })
      setDiagnosis("")
      setNotes("")
      await refetchHistory()
    } catch {
      toast({ title: "Could not save encounter", description: "Please try again.", variant: "destructive" })
    } finally {
      setSavingEncounter(false)
    }
  }

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return
    setSavingRx(true)
    try {
      await createPrescription({
        matricNumber,
        studentName: patient.name,
        studentEmail: patient.email,
        doctorName: user?.fullName ?? "Doctor",
        ...rx,
      })
      toast({ title: "Prescription submitted", description: "Pharmacy and the student have been notified." })
      setRx({ medication: "", dosage: "", frequency: "" })
      await refetchHistory()
    } catch {
      toast({ title: "Could not submit prescription", description: "Please try again.", variant: "destructive" })
    } finally {
      setSavingRx(false)
    }
  }

  return (
    <AppShell title="Consultation">
      <div className="space-y-8">
        {/* Patient header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={() => router.back()}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to queue
          </Button>
          {patientLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{patient?.name ?? matricNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  {matricNumber}
                  {patient?.department && <> &middot; {patient.department}</>}
                  {patient?.email && <> &middot; {patient.email}</>}
                </p>
              </div>
              {patient && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <PatientDemographics patient={patient} variant="clinical" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Clinical history */}
          <Card className="rounded-lg shadow-sm lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Clinical file</CardTitle>
              <CardDescription>Previous consultations and prescriptions for this student.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="encounters">
                <TabsList className="mb-4">
                  <TabsTrigger value="encounters">Consultations</TabsTrigger>
                  <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                </TabsList>

                <TabsContent value="encounters">
                  {historyLoading ? (
                    <TableSkeleton rows={3} cols={3} />
                  ) : (history?.encounters ?? []).length === 0 ? (
                    <EmptyState icon={FileText} title="No prior consultations" description="This is the student's first visit." />
                  ) : (
                    <div className="space-y-3">
                      {(history?.encounters ?? [])
                        .slice()
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((e) => (
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
                </TabsContent>

                <TabsContent value="prescriptions">
                  {historyLoading ? (
                    <TableSkeleton rows={3} cols={3} />
                  ) : (history?.prescriptions ?? []).length === 0 ? (
                    <EmptyState icon={Pill} title="No prescriptions yet" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medication</TableHead>
                          <TableHead className="hidden sm:table-cell">Dosage</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(history?.prescriptions ?? [])
                          .slice()
                          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                          .map((p) => (
                            <TableRow key={p.prescriptionId}>
                              <TableCell className="font-medium">{p.medication}</TableCell>
                              <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                                {p.dosage} &middot; {p.frequency}
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Record diagnosis</CardTitle>
                <CardDescription>Saved to the student&apos;s clinical file.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveEncounter} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      placeholder="e.g. Malaria"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Symptoms, observations, recommendations…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={savingEncounter || !diagnosis} className="w-full">
                    {savingEncounter && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save encounter
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Prescribe medication</CardTitle>
                <CardDescription>Notifies the pharmacy and emails the student.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePrescription} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medication">Medication</Label>
                    <Input
                      id="medication"
                      placeholder="e.g. Amoxicillin"
                      value={rx.medication}
                      onChange={(e) => setRx({ ...rx, medication: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="500mg"
                        value={rx.dosage}
                        onChange={(e) => setRx({ ...rx, dosage: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        placeholder="3× daily"
                        value={rx.frequency}
                        onChange={(e) => setRx({ ...rx, frequency: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={savingRx || !rx.medication || patientLoading} className="w-full">
                    {savingRx && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit prescription
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
