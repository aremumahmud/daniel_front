"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, Plus, User, Phone, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { doctorService } from "@/services/doctor.service"
import type { Appointment, Patient } from "@/lib/types/api"

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showAllDates, setShowAllDates] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [patientSearch, setPatientSearch] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  useEffect(() => {
    loadAppointments()
    loadPatients()
  }, [selectedDate, statusFilter, typeFilter, showAllDates])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: showAllDates ? 100 : 50, // Load more when showing all dates
        page: 1
      }

      // Only add date filter if not showing all dates
      if (!showAllDates) {
        params.date = selectedDate
      }

      if (statusFilter !== "all") params.status = statusFilter
      if (typeFilter !== "all") params.type = typeFilter

      const data = await doctorService.getAppointments(params)
      setAppointments(data.appointments)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadPatients = async () => {
    try {
      const data = await doctorService.getPatients({
        search: patientSearch,
        limit: 100,
        page: 1
      })
      setPatients(data.patients)
    } catch (error) {
      console.error("Failed to load patients:", error)
    }
  }

  const handleCreateAppointment = async (formData: FormData) => {
    try {
      const appointmentData = {
        patientId: selectedPatient,
        appointmentDate: formData.get("date") as string,
        appointmentTime: formData.get("time") as string,
        duration: parseInt(formData.get("duration") as string) || 30,
        type: formData.get("type") as "consultation" | "follow-up" | "check-up" | "emergency",
        reason: formData.get("reason") as string,
        priority: formData.get("priority") as "low" | "medium" | "high" || "medium",
        isVirtual: formData.get("isVirtual") === "true",
        notes: formData.get("notes") as string || undefined
      }

      await doctorService.createAppointment(appointmentData)
      toast({
        title: "Success",
        description: "Appointment created successfully",
      })
      setIsCreateDialogOpen(false)
      setSelectedPatient("")
      loadAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await doctorService.updateAppointment(appointmentId, { status: status as any })
      toast({
        title: "Success",
        description: "Appointment status updated",
      })
      loadAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    }
  }

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsDialogOpen(true)
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = appointment.patientId?.userId?.fullName ||
                       `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}` || ""
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredPatients = patients.filter(patient =>
    patient.userId?.fullName?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.userId?.email?.toLowerCase().includes(patientSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            {showAllDates
              ? `Showing all appointments • ${appointments.length} total`
              : `${new Date(selectedDate).toLocaleDateString()} • ${appointments.length} appointments`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showAllDates ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAllDates(!showAllDates)}
          >
            {showAllDates ? "Show Today Only" : "Show All Dates"}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>Select a patient and create a new appointment</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleCreateAppointment(formData)
            }}>
              <div className="grid gap-4 py-4">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label>Select Patient</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Search patients by name or email..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value)
                        loadPatients()
                      }}
                    />
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      {filteredPatients.map((patient) => (
                        <div
                          key={patient._id}
                          className={`p-3 cursor-pointer hover:bg-muted flex items-center space-x-3 ${
                            selectedPatient === patient._id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedPatient(patient._id)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={patient.userId?.avatarUrl} />
                            <AvatarFallback>
                              {patient.userId?.firstName?.[0]}{patient.userId?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{patient.userId?.fullName}</p>
                            <p className="text-xs text-muted-foreground">{patient.userId?.email}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Age: {patient.age}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input name="time" type="time" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Appointment Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="check-up">Check-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select name="duration">
                      <SelectTrigger>
                        <SelectValue placeholder="30 minutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority">
                      <SelectTrigger>
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isVirtual">Meeting Type</Label>
                    <Select name="isVirtual">
                      <SelectTrigger>
                        <SelectValue placeholder="In-person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">In-person</SelectItem>
                        <SelectItem value="true">Virtual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Appointment</Label>
                  <Textarea name="reason" placeholder="Describe the reason for this appointment" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea name="notes" placeholder="Any additional notes or instructions" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedPatient}>
                  Schedule Appointment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information for this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-lg">
                        {selectedAppointment.patientId?.firstName?.[0]}
                        {selectedAppointment.patientId?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedAppointment.patientId?.userId?.fullName ||
                           `${selectedAppointment.patientId?.firstName} ${selectedAppointment.patientId?.lastName}` ||
                           `Patient ${selectedAppointment.patientId?._id}`}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedAppointment.patientId?.age} years old • {selectedAppointment.patientId?.gender}
                        </p>
                        {selectedAppointment.patientId?.phoneNumber && (
                          <div className="flex items-center gap-1 mt-2">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{selectedAppointment.patientId.phoneNumber}</span>
                          </div>
                        )}
                        {selectedAppointment.patientId?.emailAddress && (
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{selectedAppointment.patientId.emailAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                        <p className="text-lg font-medium">
                          {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {selectedAppointment.appointmentTime}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                        <p>{selectedAppointment.durationMinutes || 30} minutes</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                        <Badge variant="outline" className="ml-2">
                          {selectedAppointment.type}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <Badge
                          variant={
                            selectedAppointment.status === "confirmed" ? "default" :
                            selectedAppointment.status === "pending" ? "secondary" :
                            selectedAppointment.status === "completed" ? "outline" :
                            selectedAppointment.status === "cancelled" ? "destructive" : "outline"
                          }
                          className="ml-2"
                        >
                          {selectedAppointment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {selectedAppointment.priority && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                          <Badge
                            variant={selectedAppointment.priority === "high" ? "destructive" : "outline"}
                            className="ml-2"
                          >
                            {selectedAppointment.priority}
                          </Badge>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Meeting Type</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {selectedAppointment.isVirtual ? (
                            <>
                              <Badge variant="secondary">Virtual</Badge>
                              {selectedAppointment.virtualMeetingLink && (
                                <Button variant="link" size="sm" className="p-0 h-auto">
                                  Join Meeting
                                </Button>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline">In-person</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p className="text-sm">{new Date(selectedAppointment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reason & Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Reason & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reason for Visit</Label>
                    <p className="mt-1">{selectedAppointment.reason}</p>
                  </div>
                  {selectedAppointment.notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Additional Notes</Label>
                      <p className="mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedAppointment.status === "pending" && (
                  <Button
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedAppointment._id, "confirmed")
                      setIsDetailsDialogOpen(false)
                    }}
                  >
                    Confirm Appointment
                  </Button>
                )}
                {selectedAppointment.status === "confirmed" && (
                  <Button>
                    Start Consultation
                  </Button>
                )}
                <Button variant="outline">
                  Edit Appointment
                </Button>
                <Button variant="outline">
                  View Patient History
                </Button>
                {selectedAppointment.status !== "completed" && selectedAppointment.status !== "cancelled" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedAppointment._id, "cancelled")
                      setIsDetailsDialogOpen(false)
                    }}
                  >
                    Cancel Appointment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search patients or reasons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
              disabled={showAllDates}
            />
            <div className="flex items-center space-x-2 px-3 py-2 border rounded-md bg-background">
              <Switch
                id="show-all-dates"
                checked={showAllDates}
                onCheckedChange={setShowAllDates}
              />
              <Label htmlFor="show-all-dates" className="text-sm whitespace-nowrap">
                All Dates
              </Label>
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="check-up">Check-up</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing:</span>
          {showAllDates ? (
            <Badge variant="secondary">All appointments</Badge>
          ) : (
            <Badge variant="outline">
              {new Date(selectedDate).toLocaleDateString()} appointments
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="outline">{statusFilter} status</Badge>
          )}
          {typeFilter !== "all" && (
            <Badge variant="outline">{typeFilter} type</Badge>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {showAllDates
                ? "You don't have any appointments scheduled."
                : selectedDate === new Date().toISOString().split('T')[0]
                  ? "You don't have any appointments scheduled for today."
                  : `No appointments found for ${new Date(selectedDate).toLocaleDateString()}.`
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule New Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {appointment.patientId?.firstName?.[0]}
                        {appointment.patientId?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.patientId?.userId?.fullName ||
                         `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}` ||
                         `Patient ${appointment.patientId?._id}`}
                      </h3>
                      <p className="text-muted-foreground">{appointment.reason}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        {showAllDates && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {appointment.appointmentTime}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {appointment.durationMinutes || 30} min
                        </div>
                        {appointment.patientId?.phoneNumber && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-4 w-4" />
                            {appointment.patientId.phoneNumber}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {appointment.type}
                        </Badge>
                        {appointment.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            High Priority
                          </Badge>
                        )}
                        {appointment.isVirtual && (
                          <Badge variant="secondary" className="text-xs">
                            Virtual
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "default"
                          : appointment.status === "pending"
                            ? "secondary"
                            : appointment.status === "completed"
                              ? "outline"
                              : appointment.status === "cancelled"
                                ? "destructive"
                                : "outline"
                      }
                    >
                      {appointment.status}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAppointmentDetails(appointment)}
                      >
                        View Details
                      </Button>
                      {appointment.status === "confirmed" && (
                        <Button size="sm">
                          Start Consultation
                        </Button>
                      )}
                      {appointment.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateAppointmentStatus(appointment._id, "confirmed")}
                        >
                          Confirm
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
