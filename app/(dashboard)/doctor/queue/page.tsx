'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePolling } from '@/hooks/use-polling'
import {
  getQueue,
  callNextPatient,
  completeQueueEntry,
  listDoctorCapacity,
  updateDoctorCapacity,
} from '@/services/clinic.service'
import { useToast } from '@/hooks/use-toast'

// Rewired for the AWS Lambda/DynamoDB backend (see MIGRATION_NOTES.md).
// There is no WebSocket/AppSync layer in this build, so this page polls
// GET /queue and GET /doctors/capacity every 15s instead of subscribing to
// Socket.IO events (the old websocket.service.ts is no longer used here).
const DoctorQueuePage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState(false)

  const { data: queue, loading: queueLoading, refetch: refetchQueue } = usePolling(
    () => getQueue({ doctorId: user?._id }),
    15000
  )
  const { data: capacities, loading: capacityLoading, refetch: refetchCapacity } = usePolling(
    listDoctorCapacity,
    15000
  )

  const myCapacity = capacities?.find((c) => c.doctorId === user?._id)
  const waiting = (queue ?? []).filter((q) => q.status === 'WAITING')
  const inProgress = (queue ?? []).filter((q) => q.status === 'IN_PROGRESS')

  const handleRefresh = async () => {
    await Promise.all([refetchQueue(), refetchCapacity()])
    toast({ title: 'Refreshed', description: 'Queue data has been updated' })
  }

  const handleGoOnline = async () => {
    try {
      await updateDoctorCapacity({ status: 'ONLINE', doctorName: user?.fullName })
      await refetchCapacity()
      toast({ title: 'Status Updated', description: 'You are now online and available for patients' })
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Failed to update status. Please try again.', variant: 'destructive' })
    }
  }

  const handleGoOffline = async () => {
    try {
      await updateDoctorCapacity({ status: 'OFFLINE', doctorName: user?.fullName })
      await refetchCapacity()
      toast({ title: 'Status Updated', description: 'You are now offline' })
    } catch (error) {
      toast({ title: 'Update Failed', description: 'Failed to update status. Please try again.', variant: 'destructive' })
    }
  }

  const handleCallNext = async () => {
    setActionLoading(true)
    try {
      const next = await callNextPatient()
      toast({ title: 'Patient Called', description: `${next.patientName} has been called in` })
      await refetchQueue()
    } catch (error) {
      toast({ title: 'No Patients Waiting', description: 'There are no patients waiting in your queue', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (queueId: string) => {
    setActionLoading(true)
    try {
      await completeQueueEntry(queueId)
      toast({ title: 'Consultation Completed' })
      await Promise.all([refetchQueue(), refetchCapacity()])
    } catch (error) {
      toast({ title: 'Failed to Complete', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  if (queueLoading || capacityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading queue dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">Manage your patient queue and consultations</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {myCapacity?.status === 'ONLINE' || myCapacity?.status === 'AT_CAPACITY' ? (
            <Button variant="outline" size="sm" onClick={handleGoOffline}>
              Go Offline
            </Button>
          ) : (
            <Button size="sm" onClick={handleGoOnline}>
              Go Online
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={myCapacity?.status === 'ONLINE' ? 'default' : 'secondary'}
              className={myCapacity?.status === 'ONLINE' ? 'bg-green-500' : ''}
            >
              {myCapacity?.status ?? 'OFFLINE'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Load</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myCapacity?.currentLoad ?? 0} / {myCapacity?.maxCapacity ?? 5}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waiting.length}</div>
            <p className="text-xs text-muted-foreground">patients waiting</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Queue</CardTitle>
          <Button onClick={handleCallNext} disabled={actionLoading || waiting.length === 0}>
            Call Next Patient
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {inProgress.map((entry) => (
            <div key={entry.queueId} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{entry.patientName}</div>
                <div className="text-xs text-muted-foreground">{entry.matricNumber} · IN PROGRESS</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => router.push(`/doctor/consultation/${encodeURIComponent(entry.matricNumber)}`)}>
                  Consult
                </Button>
                <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => handleComplete(entry.queueId)}>
                  Complete
                </Button>
              </div>
            </div>
          ))}
          {waiting.map((entry) => (
            <div key={entry.queueId} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{entry.patientName}</div>
                <div className="text-xs text-muted-foreground">{entry.matricNumber} · WAITING</div>
              </div>
              <Badge variant="outline">{entry.priority}</Badge>
            </div>
          ))}
          {(queue ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No patients in your queue right now.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorQueuePage
