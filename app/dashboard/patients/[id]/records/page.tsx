"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreVertical } from "lucide-react"

// Mock data for patient records
const mockRecords = [
  {
    id: 1,
    date: "2023-05-15",
    doctorNotes: "Patient presented with flu-like symptoms.",
    chiefComplaint: "Fever and body aches",
    diagnosis: "Influenza A",
    treatmentPlan: "Prescribed Tamiflu and recommended rest",
    nextSteps: "Follow-up in 5 days if symptoms persist",
    medications: "Tamiflu 75mg twice daily for 5 days",
  },
  {
    id: 2,
    date: "2023-06-01",
    doctorNotes: "Routine check-up, patient reports feeling well.",
    chiefComplaint: "None, routine visit",
    diagnosis: "Healthy, no concerns",
    treatmentPlan: "Continue current lifestyle and medications",
    nextSteps: "Schedule next annual check-up",
    medications: "No new prescriptions",
  },
]

export default function PatientRecordsPage() {
  const params = useParams()
  const patientId = params.id
  const [records, setRecords] = useState(mockRecords)
  const [editingRecord, setEditingRecord] = useState<(typeof mockRecords)[0] | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")

  const handleEdit = (record: (typeof mockRecords)[0]) => {
    setEditingRecord(record)
  }

  const handleDelete = (recordId: number) => {
    if (deleteConfirmation === "DELETE") {
      setRecords(records.filter((record) => record.id !== recordId))
      setDeleteConfirmation("")
    }
  }

  const handleSaveEdit = (updatedRecord: (typeof mockRecords)[0]) => {
    setRecords(records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
    setEditingRecord(null)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Patient Records</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <CardTitle>{record.date}</CardTitle>
              <CardDescription>{record.diagnosis}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Chief Complaint:</strong> {record.chiefComplaint}
              </p>
              <p>
                <strong>Treatment Plan:</strong> {record.treatmentPlan}
              </p>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => handleEdit(record)}>
                View Details
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => handleEdit(record)}>Edit</DropdownMenuItem>
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Record</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this record? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <p>Type DELETE to confirm:</p>
                        <Input value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation("")}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(record.id)}
                          disabled={deleteConfirmation !== "DELETE"}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardFooter>
          </Card>
        ))}
      </div>

      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Record</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  value={editingRecord.date}
                  onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctorNotes" className="text-right">
                  Doctor's Notes
                </Label>
                <Textarea
                  id="doctorNotes"
                  value={editingRecord.doctorNotes}
                  onChange={(e) => setEditingRecord({ ...editingRecord, doctorNotes: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="chiefComplaint" className="text-right">
                  Chief Complaint
                </Label>
                <Input
                  id="chiefComplaint"
                  value={editingRecord.chiefComplaint}
                  onChange={(e) => setEditingRecord({ ...editingRecord, chiefComplaint: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="diagnosis" className="text-right">
                  Diagnosis
                </Label>
                <Input
                  id="diagnosis"
                  value={editingRecord.diagnosis}
                  onChange={(e) => setEditingRecord({ ...editingRecord, diagnosis: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="treatmentPlan" className="text-right">
                  Treatment Plan
                </Label>
                <Textarea
                  id="treatmentPlan"
                  value={editingRecord.treatmentPlan}
                  onChange={(e) => setEditingRecord({ ...editingRecord, treatmentPlan: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nextSteps" className="text-right">
                  Next Steps
                </Label>
                <Input
                  id="nextSteps"
                  value={editingRecord.nextSteps}
                  onChange={(e) => setEditingRecord({ ...editingRecord, nextSteps: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="medications" className="text-right">
                  Medications
                </Label>
                <Textarea
                  id="medications"
                  value={editingRecord.medications}
                  onChange={(e) => setEditingRecord({ ...editingRecord, medications: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleSaveEdit(editingRecord)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
