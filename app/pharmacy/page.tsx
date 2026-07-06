"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { usePolling } from "@/hooks/use-polling"
import { getPharmacyAlerts, getPrescriptionsByMatric, updatePrescriptionStatus, getAuditLog } from "@/services/clinic.service"
import type { Prescription } from "@/lib/types/clinic"

// Pharmacy Portal — new, built from scratch (no equivalent existed in the
// old admin/doctor/patient app). FR-13 (alerts), FR-14 (lookup), FR-15
// (mark collected/rejected), FR-16 (rejection follow-up — handled
// server-side in updatePrescriptionStatus), FR-17 (audit listing).
export default function PharmacyPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "pharmacist" })
  const { toast } = useToast()

  const { data: alerts, refetch: refetchAlerts } = usePolling(() => getPharmacyAlerts("PENDING"), 30000)

  const [lookupMatric, setLookupMatric] = useState("")
  const [lookupResults, setLookupResults] = useState<Prescription[]>([])
  const [auditMatric, setAuditMatric] = useState("")
  const { data: audit, refetch: refetchAudit } = usePolling(() => getAuditLog(auditMatric || undefined), 60000)

  if (isLoading) return null

  const handleLookup = async () => {
    setLookupResults(await getPrescriptionsByMatric(lookupMatric))
  }

  const handleStatus = async (p: Prescription, status: "COLLECTED" | "REJECTED") => {
    try {
      await updatePrescriptionStatus({ prescriptionId: p.prescriptionId, matricNumber: p.matricNumber, status })
      toast({ title: `Marked ${status}`, description: `${p.medication} for ${p.matricNumber}` })
      await Promise.all([refetchAlerts(), refetchAudit()])
      setLookupResults((prev) => prev.map((r) => (r.prescriptionId === p.prescriptionId ? { ...r, status } : r)))
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">Pharmacy Portal</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Matric No.</TableCell>
                <TableCell>Medication</TableCell>
                <TableCell>Dosage / Frequency</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(alerts ?? []).map((p) => (
                <TableRow key={p.prescriptionId}>
                  <TableCell>{p.matricNumber}</TableCell>
                  <TableCell>{p.medication}</TableCell>
                  <TableCell>{p.dosage} · {p.frequency}</TableCell>
                  <TableCell>{p.doctorName}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleStatus(p, "COLLECTED")}>Collected</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleStatus(p, "REJECTED")}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(alerts ?? []).length === 0 && (
                <TableRow><TableCell colSpan={5}>No pending prescriptions.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lookup by Matriculation Number</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={lookupMatric} onChange={(e) => setLookupMatric(e.target.value)} placeholder="21/52HL001" />
            <Button onClick={handleLookup}>Lookup</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Medication</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lookupResults.map((p) => (
                <TableRow key={p.prescriptionId}>
                  <TableCell>{p.medication}</TableCell>
                  <TableCell><Badge>{p.status}</Badge></TableCell>
                  <TableCell className="flex gap-2">
                    {p.status === "PENDING" && (
                      <>
                        <Button size="sm" onClick={() => handleStatus(p, "COLLECTED")}>Collected</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleStatus(p, "REJECTED")}>Reject</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={auditMatric} onChange={(e) => setAuditMatric(e.target.value)} placeholder="Filter by matric number (optional)" />
            <Button variant="outline" onClick={() => refetchAudit()}>Refresh</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Matric No.</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>By</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(audit ?? []).map((a) => (
                <TableRow key={a.logId}>
                  <TableCell>{new Date(a.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{a.matricNumber}</TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell>{a.performedByRole}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
