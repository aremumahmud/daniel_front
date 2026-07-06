"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { usePolling } from "@/hooks/use-polling"
import { getPatient, getPatientHistory, createEncounter, createPrescription } from "@/services/clinic.service"

// Doctor Portal — FR-9 (clinical file access), FR-10 (diagnosis entry),
// FR-11 (prescription generation & submission), FR-12 (pharmacy/student
// notification — handled server-side by createPrescription's SES send).
export default function ConsultationPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "doctor" })
  const { user } = useAuth()
  const { matricNumber } = useParams<{ matricNumber: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const { data: patient } = usePolling(() => getPatient(matricNumber), 60000)
  const { data: history, refetch: refetchHistory } = usePolling(() => getPatientHistory(matricNumber), 60000)

  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [savingEncounter, setSavingEncounter] = useState(false)

  const [rx, setRx] = useState({ medication: "", dosage: "", frequency: "" })
  const [savingRx, setSavingRx] = useState(false)

  if (isLoading) return null

  const handleSaveEncounter = async () => {
    setSavingEncounter(true)
    try {
      await createEncounter({ matricNumber, doctorName: user?.fullName ?? "Doctor", diagnosis, notes })
      toast({ title: "Encounter Saved" })
      setDiagnosis("")
      setNotes("")
      await refetchHistory()
    } catch (error) {
      toast({ title: "Failed to Save Encounter", variant: "destructive" })
    } finally {
      setSavingEncounter(false)
    }
  }

  const handleSavePrescription = async () => {
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
      toast({ title: "Prescription Submitted", description: "Pharmacy and student have been notified." })
      setRx({ medication: "", dosage: "", frequency: "" })
      await refetchHistory()
    } catch (error) {
      toast({ title: "Failed to Submit Prescription", variant: "destructive" })
    } finally {
      setSavingRx(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <Button variant="ghost" onClick={() => router.back()}>← Back to Queue</Button>
      <h1 className="text-3xl font-bold">Consultation — {patient?.name ?? matricNumber}</h1>
      <p className="text-muted-foreground">{patient?.department}</p>

      <Card>
        <CardHeader><CardTitle>Clinical History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(history?.encounters ?? []).map((e) => (
                <TableRow key={e.encounterId}>
                  <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{e.diagnosis}</TableCell>
                  <TableCell>{e.notes}</TableCell>
                </TableRow>
              ))}
              {(history?.encounters ?? []).length === 0 && (
                <TableRow><TableCell colSpan={3}>No prior encounters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Record Diagnosis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Diagnosis</Label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button onClick={handleSaveEncounter} disabled={savingEncounter || !diagnosis}>Save Encounter</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Generate Prescription</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div>
            <Label>Medication</Label>
            <Input value={rx.medication} onChange={(e) => setRx({ ...rx, medication: e.target.value })} />
          </div>
          <div>
            <Label>Dosage</Label>
            <Input value={rx.dosage} onChange={(e) => setRx({ ...rx, dosage: e.target.value })} placeholder="500mg" />
          </div>
          <div>
            <Label>Frequency</Label>
            <Input value={rx.frequency} onChange={(e) => setRx({ ...rx, frequency: e.target.value })} placeholder="3 times daily" />
          </div>
          <div className="col-span-3">
            <Button onClick={handleSavePrescription} disabled={savingRx || !rx.medication}>Submit Prescription</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
