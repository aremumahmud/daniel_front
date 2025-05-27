"use client"

import type React from "react"

import { useState } from "react"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"

interface AddRecordDialogProps {
  patientId: number
  patientName: string
}

export function AddRecordDialog({ patientId, patientName }: AddRecordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <DialogContent>
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Record Added Successfully</h2>
          <p className="text-center text-gray-600">The new record for {patientName} has been added to the system.</p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Record for {patientName}</DialogTitle>
        <DialogDescription>Fill in the details for the new patient record.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="doctorNotes" className="text-right">
              Doctor's Notes
            </Label>
            <Textarea id="doctorNotes" placeholder="Quick summary of the visit" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chiefComplaint" className="text-right">
              Chief Complaint
            </Label>
            <Input id="chiefComplaint" placeholder="Why the patient came in" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="diagnosis" className="text-right">
              Diagnosis
            </Label>
            <Input
              id="diagnosis"
              placeholder="Confirmed condition or suspected issue"
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="treatmentPlan" className="text-right">
              Treatment Plan
            </Label>
            <Textarea
              id="treatmentPlan"
              placeholder="Prescriptions, procedures, lifestyle advice"
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextSteps" className="text-right">
              Next Steps
            </Label>
            <Input id="nextSteps" placeholder="Follow-up, referral, or discharge" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="medications" className="text-right">
              Medications
            </Label>
            <Textarea id="medications" placeholder="Drug Name, Dosage, Duration" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding Record..." : "Add Record"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
