"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { queueService } from "@/services/queue.service"
import { adminService } from "@/services/admin.service"
import type { DoctorCapacity } from "@/lib/types/queue"
import type { DoctorResponse } from "@/services/admin.service"

interface AssignDoctorDialogProps {
  patientId: string
  patientName: string
  onAssignmentComplete?: () => void
}

export function AssignDoctorDialog({ patientId, patientName, onAssignmentComplete }: AssignDoctorDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [assignmentMethod, setAssignmentMethod] = useState<"manual" | "auto">("auto")
  const [isAssigning, setIsAssigning] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [doctorCapacities, setDoctorCapacities] = useState<DoctorCapacity[]>([])
  const [reason, setReason] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "emergency">("medium")

  useEffect(() => {
    loadDoctors()
    loadDoctorCapacities()
  }, [])

  const loadDoctors = async () => {
    try {
      const data = await adminService.getDoctors({ limit: 100 })
      setDoctors(data.doctors)
    } catch (error) {
      console.error("Failed to load doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDoctorCapacities = async () => {
    try {
      const capacities = await queueService.getDoctorCapacities()
      setDoctorCapacities(capacities)
    } catch (error) {
      console.error("Failed to load doctor capacities:", error)
    }
  }

  const getDoctorCapacity = (doctorId: string) => {
    return doctorCapacities.find(cap => cap.doctorId === doctorId)
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const userData = typeof doctor.userId === 'object' ? doctor.userId : null
    const doctorName = userData ? `${userData.firstName} ${userData.lastName}` : `Doctor ${doctor.licenseNumber}`

    return doctorName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSpecialty === "all" || doctor.specialization === selectedSpecialty)
  })

  const handleAssign = async () => {
    if (assignmentMethod === "manual" && !selectedDoctor) {
      toast({
        title: "Error",
        description: "Please select a doctor for manual assignment",
        variant: "destructive"
      })
      return
    }

    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason for the visit",
        variant: "destructive"
      })
      return
    }

    setIsAssigning(true)

    try {
      // First add patient to queue
      const queueResult = await queueService.addPatientToQueue({
        patientId,
        priority,
        reason
      })

      if (queueResult.success) {
        // Then assign to doctor if manual assignment
        if (assignmentMethod === "manual" && selectedDoctor) {
          const assignResult = await queueService.assignPatientToDoctor({
            patientId,
            doctorId: selectedDoctor
          })

          if (assignResult.success) {
            setIsSuccess(true)
            toast({
              title: "Success",
              description: assignResult.message
            })
          } else {
            toast({
              title: "Assignment Warning",
              description: assignResult.message,
              variant: "destructive"
            })
          }
        } else {
          // Auto assignment will happen automatically
          setIsSuccess(true)
          toast({
            title: "Success",
            description: queueResult.message
          })
        }

        onAssignmentComplete?.()
      } else {
        toast({
          title: "Error",
          description: queueResult.message,
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
    } finally {
      setIsAssigning(false)
    }
  }

  if (isSuccess) {
    return (
      <DialogContent>
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Patient Added to Queue Successfully</h2>
          <p className="text-center text-gray-600">
            {patientName} has been {assignmentMethod === "manual" && selectedDoctor ?
              `assigned to ${doctors.find(d => d._id === selectedDoctor)?.userId && typeof doctors.find(d => d._id === selectedDoctor)?.userId === 'object' ?
                `Dr. ${(doctors.find(d => d._id === selectedDoctor)?.userId as any)?.firstName} ${(doctors.find(d => d._id === selectedDoctor)?.userId as any)?.lastName}` :
                'a doctor'}` :
              'added to the queue for automatic assignment'}.
          </p>
        </div>
      </DialogContent>
    )
  }

  if (loading) {
    return (
      <DialogContent>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading doctors...</p>
          </div>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add {patientName} to Queue</DialogTitle>
        <DialogDescription>
          Configure patient queue assignment and doctor selection.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        {/* Assignment Method */}
        <div className="space-y-2">
          <Label>Assignment Method</Label>
          <Select value={assignmentMethod} onValueChange={(value: "manual" | "auto") => setAssignmentMethod(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto Assignment (Round Robin)</SelectItem>
              <SelectItem value="manual">Manual Doctor Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority and Reason */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Regular checkup"
            />
          </div>
        </div>

        {/* Manual Doctor Selection */}
        {assignmentMethod === "manual" && (
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-medium">Select Doctor</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Doctors</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search doctors..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Filter by Specialty</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {Array.from(new Set(doctors.map(d => d.specialization))).map(specialty => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredDoctors.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No doctors found</p>
              ) : (
                filteredDoctors.map((doctor) => {
                  const userData = typeof doctor.userId === 'object' ? doctor.userId : null
                  const doctorName = userData ? `Dr. ${userData.firstName} ${userData.lastName}` : `Doctor ${doctor.licenseNumber}`
                  const capacity = getDoctorCapacity(doctor._id)

                  return (
                    <div
                      key={doctor._id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedDoctor === doctor._id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedDoctor(doctor._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{doctorName}</p>
                          <p className="text-sm opacity-75">{doctor.specialization}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {capacity && (
                            <>
                              <Badge variant={capacity.isOnline ? "default" : "secondary"}>
                                {capacity.isOnline ? "Online" : "Offline"}
                              </Badge>
                              <div className="flex items-center text-sm">
                                <Users className="w-3 h-3 mr-1" />
                                {capacity.currentPatients}/{capacity.maxPatients}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Auto Assignment Info */}
        {assignmentMethod === "auto" && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Automatic Assignment</h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              The patient will be automatically assigned to the next available doctor using round-robin scheduling.
              Only online doctors with available capacity will be considered.
            </p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          onClick={handleAssign}
          disabled={isAssigning || !reason || (assignmentMethod === "manual" && !selectedDoctor)}
        >
          {isAssigning ? "Processing..." : "Add to Queue"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
