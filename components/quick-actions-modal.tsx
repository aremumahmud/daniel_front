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
import { Calendar, Clock, FileText, MessageSquare, Phone, Video, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface QuickActionsModalProps {
  userType: "doctor" | "patient"
  triggerButton: React.ReactNode
}

export function QuickActionsModal({ userType, triggerButton }: QuickActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const doctorActions = [
    { id: "schedule", icon: Calendar, label: "Schedule Appointment", description: "Book appointment for patient" },
    { id: "record", icon: FileText, label: "Add Medical Record", description: "Create new patient record" },
    { id: "message", icon: MessageSquare, label: "Send Message", description: "Message a patient" },
    { id: "emergency", icon: AlertTriangle, label: "Emergency Alert", description: "Send urgent notification" },
    { id: "call", icon: Phone, label: "Schedule Call", description: "Schedule phone consultation" },
    { id: "video", icon: Video, label: "Video Consultation", description: "Start video call" },
  ]

  const patientActions = [
    { id: "appointment", icon: Calendar, label: "Book Appointment", description: "Schedule with doctor" },
    { id: "message", icon: MessageSquare, label: "Message Doctor", description: "Send message to healthcare provider" },
    { id: "symptoms", icon: FileText, label: "Log Symptoms", description: "Record current symptoms" },
    { id: "medication", icon: Clock, label: "Medication Reminder", description: "Set medication alert" },
    { id: "emergency", icon: AlertTriangle, label: "Emergency Contact", description: "Contact emergency services" },
  ]

  const actions = userType === "doctor" ? doctorActions : patientActions

  const handleActionSubmit = (actionId: string) => {
    toast({
      title: "Action Completed",
      description: `${actions.find((a) => a.id === actionId)?.label} has been processed successfully.`,
    })
    setSelectedAction(null)
  }

  const renderActionForm = (actionId: string) => {
    switch (actionId) {
      case "schedule":
      case "appointment":
        return (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{userType === "doctor" ? "Select Patient" : "Select Doctor"}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${userType === "doctor" ? "patient" : "doctor"}`} />
                </SelectTrigger>
                <SelectContent>
                  {userType === "doctor" ? (
                    <>
                      <SelectItem value="patient1">Sarah Johnson</SelectItem>
                      <SelectItem value="patient2">Michael Brown</SelectItem>
                      <SelectItem value="patient3">Emily Davis</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="dr1">Dr. Sarah Johnson - Cardiologist</SelectItem>
                      <SelectItem value="dr2">Dr. Michael Brown - General Practitioner</SelectItem>
                      <SelectItem value="dr3">Dr. Emily Davis - Endocrinologist</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea placeholder="Reason for appointment" />
            </div>
          </div>
        )

      case "record":
        return (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient1">Sarah Johnson</SelectItem>
                  <SelectItem value="patient2">Michael Brown</SelectItem>
                  <SelectItem value="patient3">Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Input placeholder="Primary diagnosis" />
            </div>
            <div className="space-y-2">
              <Label>Treatment</Label>
              <Textarea placeholder="Treatment plan and medications" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional observations" />
            </div>
          </div>
        )

      case "message":
        return (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{userType === "doctor" ? "Select Patient" : "Select Doctor"}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${userType === "doctor" ? "patient" : "doctor"}`} />
                </SelectTrigger>
                <SelectContent>
                  {userType === "doctor" ? (
                    <>
                      <SelectItem value="patient1">Sarah Johnson</SelectItem>
                      <SelectItem value="patient2">Michael Brown</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="dr1">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="dr2">Dr. Michael Brown</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Message subject" />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Type your message..." className="min-h-24" />
            </div>
          </div>
        )

      case "symptoms":
        return (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Symptom Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pain">Pain</SelectItem>
                  <SelectItem value="fever">Fever</SelectItem>
                  <SelectItem value="respiratory">Respiratory</SelectItem>
                  <SelectItem value="digestive">Digestive</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity (1-10)</Label>
              <Input type="number" min="1" max="10" placeholder="Rate severity" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe your symptoms in detail" />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input placeholder="How long have you had these symptoms?" />
            </div>
          </div>
        )

      case "medication":
        return (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Medication Name</Label>
              <Input placeholder="Enter medication name" />
            </div>
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input placeholder="e.g., 10mg" />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="How often?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Once daily</SelectItem>
                  <SelectItem value="twice">Twice daily</SelectItem>
                  <SelectItem value="three">Three times daily</SelectItem>
                  <SelectItem value="asneeded">As needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reminder Time</Label>
              <Input type="time" />
            </div>
          </div>
        )

      case "emergency":
        return (
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Emergency Alert</span>
              </div>
              <p className="text-sm">This will send an urgent notification. Use only for emergencies.</p>
            </div>
            <div className="space-y-2">
              <Label>Emergency Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="urgent">Urgent Care Needed</SelectItem>
                  <SelectItem value="medication">Medication Reaction</SelectItem>
                  <SelectItem value="other">Other Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the emergency situation" />
            </div>
            <div className="space-y-2">
              <Label>Contact Number</Label>
              <Input placeholder="Emergency contact number" />
            </div>
          </div>
        )

      default:
        return (
          <div className="py-4">
            <p className="text-center text-muted-foreground">Form for {actionId} coming soon...</p>
          </div>
        )
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Actions</DialogTitle>
          <DialogDescription>Choose an action to perform quickly</DialogDescription>
        </DialogHeader>

        {!selectedAction ? (
          <div className="grid gap-3 py-4">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => setSelectedAction(action.id)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 py-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAction(null)}>
                ← Back
              </Button>
              <Badge variant="outline">{actions.find((a) => a.id === selectedAction)?.label}</Badge>
            </div>
            {renderActionForm(selectedAction)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAction(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleActionSubmit(selectedAction)}>Submit</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
