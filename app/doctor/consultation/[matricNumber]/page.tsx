"use client"

import type React from "react"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Loader2, Pill, Plus, X } from "lucide-react"

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
import { prescriptionMedications } from "@/lib/prescriptions"

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

  const [meds, setMeds] = useState<{ medication: string; dosage: string; frequency: string }[]>([
    { medication: "", dosage: "", frequency: "" },
  ])
  const [savingRx, setSavingRx] = useState(false)

  if (isLoading) return null

  const updateMed = (i: number, field: "medication" | "dosage" | "frequency", value: string) =>
    setMeds((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)))
  const addMed = () => setMeds((prev) => [...prev, { medication: "", dosage: "", frequency: "" }])
  const removeMed = (i: number) => setMeds((prev) => prev.filter((_, idx) => idx !== i))
  const filledMeds = meds.filter((m) => m.medication.trim())

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
    if (filledMeds.length === 0) {
      toast({ title: "Add at least one medication", variant: "destructive" })
      return
    }
    setSavingRx(true)
    try {
      await createPrescription({
        matricNumber,
        studentName: patient.name,
        studentEmail: patient.email,
        doctorName: user?.fullName ?? "Doctor",
        medications: filledMeds.map((m) => ({
          medication: m.medication.trim(),
          dosage: m.dosage.trim(),
          frequency: m.frequency.trim(),
        })),
      })
      toast({ title: "Prescription submitted", description: "Pharmacy and the student have been notified." })
      setMeds([{ medication: "", dosage: "", frequency: "" }])
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
                    <div className="space-y-3">
                      {(history?.prescriptions ?? [])
                        .slice()
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((p) => (
                          <div key={p.prescriptionId} className="rounded-lg border p-4">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <StatusBadge status={p.status} />
                              <p className="text-xs text-muted-foreground">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <ul className="space-y-1">
                              {prescriptionMedications(p).map((m, i) => (
                                <li key={i} className="text-sm">
                                  <span className="font-medium">{m.medication}</span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    — {m.dosage}, {m.frequency}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
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
                <CardDescription>
                  Add every drug for this visit, then submit once. Notifies the pharmacy and emails the
                  patient.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePrescription} className="space-y-4">
                  {meds.map((m, i) => (
                    <div key={i} className="space-y-3 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Medication {i + 1}
                        </p>
                        {meds.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-muted-foreground"
                            onClick={() => removeMed(i)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="e.g. Amoxicillin"
                        value={m.medication}
                        onChange={(e) => updateMed(i, "medication", e.target.value)}
                        aria-label={`Medication ${i + 1} name`}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Dosage (500mg)"
                          value={m.dosage}
                          onChange={(e) => updateMed(i, "dosage", e.target.value)}
                          aria-label={`Medication ${i + 1} dosage`}
                        />
                        <Input
                          placeholder="Frequency (3× daily)"
                          value={m.frequency}
                          onChange={(e) => updateMed(i, "frequency", e.target.value)}
                          aria-label={`Medication ${i + 1} frequency`}
                        />
                      </div>
                    </div>
                  ))}

                  {meds.length >= 5 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      That&apos;s a lot of medications for one visit — double-check before submitting.
                    </p>
                  )}

                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={addMed}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add another medication
                  </Button>

                  <Button
                    type="submit"
                    disabled={savingRx || filledMeds.length === 0 || patientLoading}
                    className="w-full"
                  >
                    {savingRx && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit prescription
                    {filledMeds.length > 1 ? ` (${filledMeds.length} drugs)` : ""}
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
