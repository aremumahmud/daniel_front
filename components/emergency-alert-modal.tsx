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
import { AlertTriangle, Phone, MapPin, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EmergencyAlertModalProps {
  triggerButton: React.ReactNode
  userType: "doctor" | "patient"
}

export function EmergencyAlertModal({ triggerButton, userType }: EmergencyAlertModalProps) {
  const [emergencyData, setEmergencyData] = useState({
    type: "",
    severity: "",
    description: "",
    location: "",
    contactNumber: "",
    symptoms: "",
    consciousness: "",
    breathing: "",
  })

  const handleEmergencySubmit = () => {
    toast({
      title: "Emergency Alert Sent",
      description: "Emergency services have been notified. Help is on the way.",
      variant: "destructive",
    })

    // Reset form
    setEmergencyData({
      type: "",
      severity: "",
      description: "",
      location: "",
      contactNumber: "",
      symptoms: "",
      consciousness: "",
      breathing: "",
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Emergency Alert
          </DialogTitle>
          <DialogDescription>
            This will immediately notify emergency services and your healthcare providers. Only use for genuine
            emergencies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Emergency Type */}
          <div className="space-y-2">
            <Label>Emergency Type</Label>
            <Select
              value={emergencyData.type}
              onValueChange={(value) => setEmergencyData({ ...emergencyData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select emergency type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardiac">Cardiac Emergency</SelectItem>
                <SelectItem value="respiratory">Breathing Problems</SelectItem>
                <SelectItem value="stroke">Stroke Symptoms</SelectItem>
                <SelectItem value="trauma">Injury/Trauma</SelectItem>
                <SelectItem value="allergic">Allergic Reaction</SelectItem>
                <SelectItem value="overdose">Drug Overdose</SelectItem>
                <SelectItem value="mental">Mental Health Crisis</SelectItem>
                <SelectItem value="other">Other Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Severity Level */}
          <div className="space-y-2">
            <Label>Severity Level</Label>
            <Select
              value={emergencyData.severity}
              onValueChange={(value) => setEmergencyData({ ...emergencyData, severity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="How severe is the emergency?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical - Life threatening</SelectItem>
                <SelectItem value="severe">Severe - Immediate attention needed</SelectItem>
                <SelectItem value="moderate">Moderate - Urgent care required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Assessment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient Consciousness</Label>
              <Select
                value={emergencyData.consciousness}
                onValueChange={(value) => setEmergencyData({ ...emergencyData, consciousness: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Consciousness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alert">Alert and responsive</SelectItem>
                  <SelectItem value="confused">Confused</SelectItem>
                  <SelectItem value="unconscious">Unconscious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Breathing Status</Label>
              <Select
                value={emergencyData.breathing}
                onValueChange={(value) => setEmergencyData({ ...emergencyData, breathing: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Breathing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal breathing</SelectItem>
                  <SelectItem value="difficulty">Difficulty breathing</SelectItem>
                  <SelectItem value="none">Not breathing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description of Emergency</Label>
            <Textarea
              placeholder="Describe what happened and current symptoms..."
              value={emergencyData.description}
              onChange={(e) => setEmergencyData({ ...emergencyData, description: e.target.value })}
              className="min-h-20"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Current Location
            </Label>
            <Input
              placeholder="Exact address or location details"
              value={emergencyData.location}
              onChange={(e) => setEmergencyData({ ...emergencyData, location: e.target.value })}
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Number
            </Label>
            <Input
              placeholder="Phone number for emergency contact"
              value={emergencyData.contactNumber}
              onChange={(e) => setEmergencyData({ ...emergencyData, contactNumber: e.target.value })}
            />
          </div>

          {/* Emergency Actions */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="font-semibold text-destructive mb-2">Emergency Actions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Emergency services will be contacted immediately</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Your emergency contacts will be notified</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Your healthcare providers will receive an alert</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleEmergencySubmit}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!emergencyData.type || !emergencyData.severity || !emergencyData.description}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Send Emergency Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
