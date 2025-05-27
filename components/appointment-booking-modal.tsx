"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AppointmentBookingModalProps {
  triggerButton: React.ReactNode
  userType: "doctor" | "patient"
  preselectedDoctor?: string
  preselectedPatient?: string
}

export function AppointmentBookingModal({
  triggerButton,
  userType,
  preselectedDoctor,
  preselectedPatient,
}: AppointmentBookingModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    doctor: preselectedDoctor || "",
    patient: preselectedPatient || "",
    date: "",
    time: "",
    type: "",
    reason: "",
    location: "",
    duration: "30",
    priority: "medium",
  })

  const doctors = [
    { id: "dr-sarah", name: "Dr. Sarah Johnson", specialty: "Cardiologist", available: true },
    { id: "dr-michael", name: "Dr. Michael Brown", specialty: "General Practitioner", available: true },
    { id: "dr-emily", name: "Dr. Emily Davis", specialty: "Endocrinologist", available: false },
    { id: "dr-robert", name: "Dr. Robert Wilson", specialty: "Neurologist", available: true },
  ]

  const patients = [
    { id: "patient-1", name: "Jane Doe", age: 34, lastVisit: "2024-01-15" },
    { id: "patient-2", name: "John Smith", age: 45, lastVisit: "2024-01-10" },
    { id: "patient-3", name: "Mary Johnson", age: 62, lastVisit: "2024-01-08" },
  ]

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  const handleSubmit = () => {
    toast({
      title: "Appointment Booked",
      description: `Appointment has been scheduled successfully for ${formData.date} at ${formData.time}.`,
    })
    setStep(1)
    setFormData({
      doctor: preselectedDoctor || "",
      patient: preselectedPatient || "",
      date: "",
      time: "",
      type: "",
      reason: "",
      location: "",
      duration: "30",
      priority: "medium",
    })
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      {userType === "doctor" ? (
        <div className="space-y-2">
          <Label>Select Patient</Label>
          <Select value={formData.patient} onValueChange={(value) => setFormData({ ...formData, patient: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{patient.name}</span>
                    <Badge variant="outline" className="ml-2">
                      Age {patient.age}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Select Doctor</Label>
          <Select value={formData.doctor} onValueChange={(value) => setFormData({ ...formData, doctor: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id} disabled={!doctor.available}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span>{doctor.name}</span>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                    <Badge variant={doctor.available ? "default" : "secondary"} className="ml-2">
                      {doctor.available ? "Available" : "Busy"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Appointment Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select appointment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="check-up">Check-up</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="procedure">Procedure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Reason for Visit</Label>
        <Textarea
          placeholder="Describe the reason for this appointment"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Preferred Date</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="space-y-2">
        <Label>Available Time Slots</Label>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={formData.time === time ? "default" : "outline"}
              size="sm"
              onClick={() => setFormData({ ...formData, time: time })}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="room-101">Room 101 - General Medicine</SelectItem>
            <SelectItem value="room-205">Room 205 - Cardiology</SelectItem>
            <SelectItem value="room-305">Room 305 - Dermatology</SelectItem>
            <SelectItem value="telehealth">Telehealth - Video Call</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const selectedDoctor = doctors.find((d) => d.id === formData.doctor)
    const selectedPatient = patients.find((p) => p.id === formData.patient)

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-3">Appointment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                {userType === "doctor"
                  ? `Patient: ${selectedPatient?.name}`
                  : `Doctor: ${selectedDoctor?.name} (${selectedDoctor?.specialty})`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Date: {formData.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Time: {formData.time} ({formData.duration} minutes)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Location: {formData.location}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <p className="text-sm bg-muted p-2 rounded">{formData.type}</p>
        </div>

        <div className="space-y-2">
          <Label>Reason</Label>
          <p className="text-sm bg-muted p-2 rounded">{formData.reason}</p>
        </div>

        <div className="flex items-center gap-2">
          <Label>Priority:</Label>
          <Badge variant={formData.priority === "urgent" ? "destructive" : "default"}>{formData.priority}</Badge>
        </div>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{userType === "doctor" ? "Schedule Patient Appointment" : "Book Appointment"}</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? "Basic Information" : step === 2 ? "Date & Time" : "Confirmation"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!formData.doctor || !formData.patient || !formData.type || !formData.reason)) ||
                (step === 2 && (!formData.date || !formData.time || !formData.location))
              }
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Book Appointment</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
