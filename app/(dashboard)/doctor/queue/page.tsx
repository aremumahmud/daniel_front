"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, ListOrdered, Loader2, PhoneCall, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { AppShell } from "@/components/shell/app-shell"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { StatCard } from "@/components/shell/stat-card"
import { StatusBadge } from "@/components/shell/status-badge"
import { TableSkeleton } from "@/components/shell/table-skeleton"

import { useAuth } from "@/hooks/use-auth"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { usePolling } from "@/hooks/use-polling"
import { useToast } from "@/hooks/use-toast"
import {
  callNextPatient,
  completeQueueEntry,
  getQueue,
  listDoctorCapacity,
  updateDoctorCapacity,
} from "@/services/clinic.service"

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

export default function DoctorQueuePage() {
  const { isLoading } = useAuthGuard({ requiredRole: "doctor" })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const { data: queue, loading: queueLoading, refetch: refetchQueue } = usePolling(
    () => getQueue({ doctorId: user?._id }),
    15000,
  )
  const { data: capacities, loading: capacityLoading, refetch: refetchCapacity } = usePolling(
    listDoctorCapacity,
    15000,
  )

  if (isLoading) return null

  const myCapacity = capacities?.find((c) => c.doctorId === user?._id)
  const isOnline = myCapacity?.status === "ONLINE" || myCapacity?.status === "AT_CAPACITY"
  const waiting = (queue ?? []).filter((q) => q.status === "WAITING")
  const inProgress = (queue ?? []).filter((q) => q.status === "IN_PROGRESS")

  const handleToggleOnline = async (next: boolean) => {
    setStatusUpdating(true)
    try {
      await updateDoctorCapacity({ status: next ? "ONLINE" : "OFFLINE", doctorName: user?.fullName })
      await refetchCapacity()
      toast({
        title: next ? "You're online" : "You're offline",
        description: next ? "Reception can now assign patients to you." : "You won't receive new patients.",
      })
    } catch {
      toast({ title: "Status update failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setStatusUpdating(false)
    }
  }

  const handleCallNext = async () => {
    setActionLoading(true)
    try {
      const next = await callNextPatient()
      toast({ title: "Patient called", description: `${next.patientName} has been called in.` })
      await refetchQueue()
    } catch {
      toast({
        title: "No patients waiting",
        description: "Your queue is empty right now.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (queueId: string) => {
    setActionLoading(true)
    try {
      await completeQueueEntry(queueId)
      toast({ title: "Consultation completed" })
      await Promise.all([refetchQueue(), refetchCapacity()])
    } catch {
      toast({ title: "Could not complete", description: "Please try again.", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AppShell title="My Queue">
      <div className="space-y-8">
        <PageHeader
          title="My Queue"
          description="Call patients in order, consult, and mark visits complete."
          actions={
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Label htmlFor="online-toggle" className="text-sm font-normal text-muted-foreground">
                {isOnline ? "Online" : "Offline"}
              </Label>
              <Switch
                id="online-toggle"
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                disabled={statusUpdating || capacityLoading}
                aria-label="Toggle online status"
              />
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Status"
            value={<StatusBadge status={myCapacity?.status ?? "OFFLINE"} className="text-sm" />}
            icon={Users}
            loading={capacityLoading}
          />
          <StatCard
            label="Current load"
            value={`${myCapacity?.currentLoad ?? 0} / ${myCapacity?.maxCapacity ?? 5}`}
            hint="patients in consultation"
            icon={Users}
            loading={capacityLoading}
          />
          <StatCard label="Waiting" value={waiting.length} hint="assigned to you" icon={Clock} loading={queueLoading} />
        </div>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-base">Today&apos;s patients</CardTitle>
              <CardDescription>Updates automatically every 15 seconds.</CardDescription>
            </div>
            <Button onClick={handleCallNext} disabled={actionLoading || waiting.length === 0}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PhoneCall className="mr-2 h-4 w-4" />}
              Call next patient
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {queueLoading ? (
              <TableSkeleton rows={4} cols={3} />
            ) : (queue ?? []).length === 0 ? (
              <EmptyState
                icon={ListOrdered}
                title="Your queue is empty"
                description={
                  isOnline
                    ? "Patients assigned to you by reception will appear here."
                    : "Go online so reception can assign patients to you."
                }
              />
            ) : (
              <>
                {inProgress.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">In consultation</p>
                    {inProgress.map((entry) => (
                      <div
                        key={entry.queueId}
                        className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">{entry.patientName}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.matricNumber}
                            {entry.calledAt && <> &middot; called {timeAgo(entry.calledAt)}</>}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusBadge status={entry.status} />
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(`/doctor/consultation/${encodeURIComponent(entry.matricNumber)}`)
                            }
                          >
                            Open consultation
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading}
                            onClick={() => handleComplete(entry.queueId)}
                          >
                            Complete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {inProgress.length > 0 && waiting.length > 0 && <Separator />}

                {waiting.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Waiting</p>
                    {waiting.map((entry, i) => (
                      <div
                        key={entry.queueId}
                        className="flex items-center justify-between gap-3 rounded-lg border p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-muted/50 text-xs font-medium tabular-nums text-muted-foreground">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{entry.patientName}</p>
                            <p className="text-xs text-muted-foreground">
                              {entry.matricNumber} &middot; queued {timeAgo(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={entry.priority} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
