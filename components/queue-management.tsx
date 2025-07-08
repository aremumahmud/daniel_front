"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { queueService } from "@/services/queue.service"
import { adminService } from "@/services/admin.service"
import type { QueuedPatient, DoctorCapacity, QueueStats, AddToQueueRequest } from "@/lib/types/queue"
import type { PatientListItem } from "@/services/admin.service"
import { 
  Users, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Plus, 
  RotateCcw, 
  Settings,
  Activity,
  UserX,
  CheckCircle,
  XCircle
} from "lucide-react"

export function QueueManagement() {
  const [queue, setQueue] = useState<QueuedPatient[]>([])
  const [doctorCapacities, setDoctorCapacities] = useState<DoctorCapacity[]>([])
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null)
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "emergency">("medium")
  const [reason, setReason] = useState("")
  const [symptoms, setSymptoms] = useState("")

  useEffect(() => {
    loadQueueData()
    loadPatients()
    // Refresh every 30 seconds
    const interval = setInterval(loadQueueData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadQueueData = async () => {
    try {
      const data = await queueService.getQueueStatus()
      setQueue(data.queue)
      setDoctorCapacities(data.doctorCapacities)
      setQueueStats(data.stats)
    } catch (error) {
      console.error("Failed to load queue data:", error)
      toast({
        title: "Error",
        description: "Failed to load queue data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      const data = await adminService.getPatients({ limit: 100 })
      setPatients(data.patients)
    } catch (error) {
      console.error("Failed to load patients:", error)
    }
  }

  const handleAddToQueue = async () => {
    if (!selectedPatient || !reason) {
      toast({
        title: "Error",
        description: "Please select a patient and provide a reason",
        variant: "destructive"
      })
      return
    }

    try {
      const request: AddToQueueRequest = {
        patientId: selectedPatient,
        priority,
        reason,
        symptoms: symptoms || undefined
      }

      const result = await queueService.addPatientToQueue(request)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        setAddPatientDialogOpen(false)
        setSelectedPatient("")
        setReason("")
        setSymptoms("")
        loadQueueData()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to add patient to queue:", error)
      toast({
        title: "Error",
        description: "Failed to add patient to queue",
        variant: "destructive"
      })
    }
  }

  const handleAssignPatient = async (patientId: string, doctorId?: string) => {
    try {
      const result = await queueService.assignPatientToDoctor({
        patientId,
        doctorId
      })

      if (result.success) {
        toast({
          title: "Success",
          description: result.message
        })
        loadQueueData()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to assign patient:", error)
      toast({
        title: "Error",
        description: "Failed to assign patient",
        variant: "destructive"
      })
    }
  }

  const handleAutoAssign = async () => {
    try {
      const results = await queueService.autoAssignWaitingPatients()
      const successCount = results.filter(r => r.success).length
      
      toast({
        title: "Auto Assignment Complete",
        description: `Successfully assigned ${successCount} patients`
      })
      loadQueueData()
    } catch (error) {
      console.error("Failed to auto-assign patients:", error)
      toast({
        title: "Error",
        description: "Failed to auto-assign patients",
        variant: "destructive"
      })
    }
  }

  const handleToggleDoctorStatus = async (doctorId: string, isOnline: boolean) => {
    try {
      await queueService.setDoctorOnlineStatus(doctorId, isOnline)
      toast({
        title: "Success",
        description: `Doctor status updated to ${isOnline ? 'online' : 'offline'}`
      })
      loadQueueData()
    } catch (error) {
      console.error("Failed to update doctor status:", error)
      toast({
        title: "Error",
        description: "Failed to update doctor status",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency": return "bg-red-500"
      case "high": return "bg-orange-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-blue-500"
      case "assigned": return "bg-purple-500"
      case "in-consultation": return "bg-orange-500"
      case "completed": return "bg-green-500"
      case "cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  if (loading) {
    return <div className="p-6">Loading queue management...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Queue Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleAutoAssign} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Auto Assign
          </Button>
          <Dialog open={addPatientDialogOpen} onOpenChange={setAddPatientDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add to Queue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Patient to Queue</DialogTitle>
                <DialogDescription>
                  Select a patient and provide consultation details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient">Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName} - {patient.emailAddress}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Regular checkup, Follow-up"
                  />
                </div>
                <div>
                  <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                  <Input
                    id="symptoms"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Brief description of symptoms"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddToQueue}>Add to Queue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {queueStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiting</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.totalWaiting}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Consultation</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.totalInConsultation}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueStats.availableDoctors}/{queueStats.totalDoctors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(queueStats.averageWaitTime)}m</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Patient Queue</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Queue</CardTitle>
              <CardDescription>
                Manage patient queue and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients in queue
                  </div>
                ) : (
                  queue.map((patient) => (
                    <div key={patient._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-semibold">#{patient.position}</div>
                        <div>
                          <div className="font-medium">{patient.patientName}</div>
                          <div className="text-sm text-muted-foreground">{patient.reason}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getPriorityColor(patient.priority)}>
                              {patient.priority}
                            </Badge>
                            <Badge className={getStatusColor(patient.status)}>
                              {patient.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {patient.estimatedWaitTime && (
                          <div className="text-sm text-muted-foreground">
                            ~{patient.estimatedWaitTime}m wait
                          </div>
                        )}
                        {patient.status === "waiting" && (
                          <Button
                            size="sm"
                            onClick={() => handleAssignPatient(patient.patientId)}
                          >
                            Auto Assign
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Capacity Management</CardTitle>
              <CardDescription>
                Monitor and manage doctor availability and patient capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorCapacities.map((doctor) => (
                  <div key={doctor.doctorId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${doctor.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="font-medium">{doctor.doctorName}</div>
                        <div className="text-sm text-muted-foreground">{doctor.specialization}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        {doctor.currentPatients}/{doctor.maxPatients} patients
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={doctor.isAvailable ? "default" : "secondary"}>
                          {doctor.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleDoctorStatus(doctor.doctorId, !doctor.isOnline)}
                        >
                          {doctor.isOnline ? (
                            <>
                              <UserX className="mr-1 h-3 w-3" />
                              Set Offline
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-1 h-3 w-3" />
                              Set Online
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
