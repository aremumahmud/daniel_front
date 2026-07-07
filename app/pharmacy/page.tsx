"use client"

import type React from "react"
import { useState } from "react"
import { CheckCircle2, ClipboardList, Loader2, Pill, Search, XCircle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AppShell } from "@/components/shell/app-shell"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { StatCard } from "@/components/shell/stat-card"
import { StatusBadge } from "@/components/shell/status-badge"
import { TableSkeleton } from "@/components/shell/table-skeleton"

import { useAuthGuard } from "@/hooks/use-auth-guard"
import { usePolling } from "@/hooks/use-polling"
import { useToast } from "@/hooks/use-toast"
import {
  getAuditLog,
  getPharmacyAlerts,
  getPrescriptionsByMatric,
  updatePrescriptionStatus,
} from "@/services/clinic.service"
import type { Prescription } from "@/lib/types/clinic"

export default function PharmacyPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "pharmacist" })
  const { toast } = useToast()

  const { data: alerts, loading: alertsLoading, refetch: refetchAlerts } = usePolling(
    () => getPharmacyAlerts("PENDING"),
    30000,
  )

  const [lookupMatric, setLookupMatric] = useState("")
  const [lookupResults, setLookupResults] = useState<Prescription[] | null>(null)
  const [lookingUp, setLookingUp] = useState(false)

  const [auditMatric, setAuditMatric] = useState("")
  const { data: audit, loading: auditLoading, refetch: refetchAudit } = usePolling(
    () => getAuditLog(auditMatric.trim() || undefined),
    60000,
  )

  // Rejection is destructive-ish (triggers a follow-up email to the
  // student), so it gets a confirm dialog; collection doesn't.
  const [rejecting, setRejecting] = useState<Prescription | null>(null)
  const [updating, setUpdating] = useState(false)

  if (isLoading) return null

  const pending = alerts ?? []

  const applyStatus = async (p: Prescription, status: "COLLECTED" | "REJECTED") => {
    setUpdating(true)
    try {
      await updatePrescriptionStatus({ prescriptionId: p.prescriptionId, matricNumber: p.matricNumber, status })
      toast({
        title: status === "COLLECTED" ? "Marked as collected" : "Prescription rejected",
        description:
          status === "COLLECTED"
            ? `${p.medication} for ${p.matricNumber}.`
            : `The student has been notified to follow up with their doctor.`,
      })
      await Promise.all([refetchAlerts(), refetchAudit()])
      setLookupResults((prev) =>
        prev ? prev.map((r) => (r.prescriptionId === p.prescriptionId ? { ...r, status } : r)) : prev,
      )
    } catch {
      toast({ title: "Update failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setUpdating(false)
      setRejecting(null)
    }
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupMatric.trim()) return
    setLookingUp(true)
    try {
      setLookupResults(await getPrescriptionsByMatric(lookupMatric.trim()))
    } catch {
      toast({ title: "Lookup failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setLookingUp(false)
    }
  }

  const renderActions = (p: Prescription) =>
    p.status === "PENDING" ? (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" disabled={updating} onClick={() => setRejecting(p)}>
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Reject
        </Button>
        <Button size="sm" disabled={updating} onClick={() => applyStatus(p, "COLLECTED")}>
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Collected
        </Button>
      </div>
    ) : null

  return (
    <AppShell title="Pharmacy">
      <div className="space-y-8">
        <PageHeader
          title="Pharmacy"
          description="Fulfil pending prescriptions and keep the dispensing audit trail."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Pending prescriptions"
            value={pending.length}
            hint="awaiting collection"
            icon={Pill}
            loading={alertsLoading}
          />
          <StatCard
            label="Audit entries"
            value={(audit ?? []).length}
            hint={auditMatric.trim() ? `for ${auditMatric.trim()}` : "all recent activity"}
            icon={ClipboardList}
            loading={auditLoading}
          />
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="lookup">Lookup</TabsTrigger>
            <TabsTrigger value="audit">Audit log</TabsTrigger>
          </TabsList>

          {/* ---- Pending ---- */}
          <TabsContent value="pending">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Pending prescriptions</CardTitle>
                <CardDescription>Checked automatically every 30 seconds.</CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : pending.length === 0 ? (
                  <EmptyState
                    icon={Pill}
                    title="All caught up"
                    description="New prescriptions from doctors will appear here."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead className="hidden md:table-cell">Prescribed by</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="w-0" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map((p) => (
                        <TableRow key={p.prescriptionId}>
                          <TableCell className="font-medium">{p.matricNumber}</TableCell>
                          <TableCell>
                            <p className="font-medium">{p.medication}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.dosage} &middot; {p.frequency}
                            </p>
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                            {p.doctorName}
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{renderActions(p)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Lookup ---- */}
          <TabsContent value="lookup">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Lookup by matriculation number</CardTitle>
                <CardDescription>Find every prescription on a student&apos;s record.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLookup} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={lookupMatric}
                      onChange={(e) => setLookupMatric(e.target.value)}
                      placeholder="21/52HL001"
                      className="pl-9"
                      aria-label="Matriculation number"
                    />
                  </div>
                  <Button type="submit" disabled={lookingUp || !lookupMatric.trim()}>
                    {lookingUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lookup
                  </Button>
                </form>

                {lookupResults === null ? null : lookupResults.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No prescriptions found"
                    description="Nothing on record for that matriculation number."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medication</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-0" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lookupResults
                        .slice()
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((p) => (
                          <TableRow key={p.prescriptionId}>
                            <TableCell>
                              <p className="font-medium">{p.medication}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.dosage} &middot; {p.frequency}
                              </p>
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={p.status} />
                            </TableCell>
                            <TableCell>{renderActions(p)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Audit ---- */}
          <TabsContent value="audit">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Audit log</CardTitle>
                <CardDescription>Every registration, consultation and dispensing action.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    refetchAudit()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={auditMatric}
                    onChange={(e) => setAuditMatric(e.target.value)}
                    placeholder="Filter by matriculation number (optional)"
                    className="max-w-sm"
                    aria-label="Filter audit log"
                  />
                  <Button type="submit" variant="outline">
                    Apply
                  </Button>
                </form>

                {auditLoading ? (
                  <TableSkeleton rows={5} cols={4} />
                ) : (audit ?? []).length === 0 ? (
                  <EmptyState icon={ClipboardList} title="No audit entries" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="hidden sm:table-cell">By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(audit ?? [])
                        .slice()
                        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                        .map((a) => (
                          <TableRow key={a.logId}>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(a.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm">{a.matricNumber}</TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {a.action.replaceAll("_", " ").toLowerCase()}
                              </span>
                            </TableCell>
                            <TableCell className="hidden text-sm capitalize text-muted-foreground sm:table-cell">
                              {a.performedByRole}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject confirmation */}
      <AlertDialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this prescription?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejecting && (
                <>
                  {rejecting.medication} ({rejecting.dosage}) for {rejecting.matricNumber} will be marked as
                  rejected, and the student will be emailed to follow up with their doctor.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              onClick={() => rejecting && applyStatus(rejecting, "REJECTED")}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject prescription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
