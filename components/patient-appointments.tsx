"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Plus, MapPin } from "lucide-react"
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
import { patientService } from "@/services/patient.service"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Appointment } from "@/lib/types/api"

export function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("upcoming")

  useEffect(() => {
    loadAppointments()
  }, [filter])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const params = {
        status: filter === "upcoming" ? ("scheduled" as const) : undefined,
        limit: 20,
        page: 1,
      }
      const data = await patientService.getAppointments(params)
      setAppointments(data.appointments)
    } catch (error) {
      console.error("Failed to load appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async (appointmentData: any) => {
    try {
      await patientService.bookAppointment(appointmentData)
      toast({
        title: "Success",
        description: "Appointment booked successfully",
      })
      loadAppointments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      })
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate)
    const today = new Date()

    if (filter === "upcoming") {
      return appointmentDate >= today
    } else if (filter === "past") {
      return appointmentDate < today
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>Schedule an appointment with a healthcare provider</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleBookAppointment({
                  doctorId: formData.get("doctor"),
                  appointmentDate: formData.get("date"),
                  appointmentTime: formData.get("time"),
                  type: formData.get("type"),
                  reason: formData.get("reason"),
                  priority: "medium",
                })
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="doctor" className="text-right">
                    Doctor
                  </Label>
                  <Select name="doctor" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-sarah">Dr. Sarah Johnson - Cardiologist</SelectItem>
                      <SelectItem value="dr-michael">Dr. Michael Brown - General Practitioner</SelectItem>
                      <SelectItem value="dr-emily">Dr. Emily Davis - Dermatologist</SelectItem>
                      <SelectItem value="dr-robert">Dr. Robert Wilson - Neurologist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Preferred Date
                  </Label>
                  <Input name="date" type="date" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Preferred Time
                  </Label>
                  <Select name="time" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                      <SelectItem value="16:00">04:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Appointment Type
                  </Label>
                  <Select name="type" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="check-up">Check-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reason" className="text-right">
                    Reason
                  </Label>
                  <Textarea
                    name="reason"
                    placeholder="Describe your symptoms or reason for visit"
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Book Appointment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button variant={filter === "upcoming" ? "default" : "outline"} onClick={() => setFilter("upcoming")}>
          Upcoming
        </Button>
        <Button variant={filter === "past" ? "default" : "outline"} onClick={() => setFilter("past")}>
          Past
        </Button>
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All
        </Button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{appointment.doctorId?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">Dr. {appointment.doctorId}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {appointment.appointmentTime}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-4 w-4" />
                          {appointment.isVirtual ? "Virtual" : "In-person"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "default"
                          : appointment.status === "pending"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {appointment.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredAppointments.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "upcoming"
                ? "You don't have any upcoming appointments."
                : "No appointments found for the selected filter."}
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Book Your First Appointment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book New Appointment</DialogTitle>
                  <DialogDescription>Schedule an appointment with a healthcare provider</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleBookAppointment({
                      doctorId: formData.get("doctor"),
                      appointmentDate: formData.get("date"),
                      appointmentTime: formData.get("time"),
                      type: formData.get("type"),
                      reason: formData.get("reason"),
                      priority: "medium",
                    })
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Doctor</Label>
                      <Select name="doctor" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dr-sarah">Dr. Sarah Johnson - Cardiologist</SelectItem>
                          <SelectItem value="dr-michael">Dr. Michael Brown - General Practitioner</SelectItem>
                          <SelectItem value="dr-emily">Dr. Emily Davis - Dermatologist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Date</Label>
                      <Input name="date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Visit</Label>
                      <Textarea name="reason" placeholder="Describe your health concerns" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Schedule Appointment</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
