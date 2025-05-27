"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState } from "react"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AssignDoctorDialogProps {
  patientId: number
  patientName: string
}

const doctors = [
  { id: 1, name: "Dr. John Smith", specialty: "Cardiology" },
  { id: 2, name: "Dr. Sarah Johnson", specialty: "Neurology" },
  { id: 3, name: "Dr. Michael Lee", specialty: "Pediatrics" },
  { id: 4, name: "Dr. Emily Chen", specialty: "Dermatology" },
  { id: 5, name: "Dr. David Brown", specialty: "Orthopedics" },
]

export function AssignDoctorDialog({ patientId, patientName }: AssignDoctorDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSpecialty === "" || doctor.specialty === selectedSpecialty),
  )

  const handleAssign = async () => {
    if (!selectedDoctor) return
    setIsAssigning(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsAssigning(false)
    setIsSuccess(true)
  }

  if (isSuccess) {
    return (
      <DialogContent>
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Doctor Assigned Successfully</h2>
          <p className="text-center text-gray-600">
            {patientName} has been assigned to {selectedDoctor}.
          </p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign Doctor to {patientName}</DialogTitle>
        <DialogDescription>Search and select a doctor to assign to this patient.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="search" className="text-right">
            Search
          </Label>
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors..."
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="specialty" className="text-right">
            Specialty
          </Label>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Neurology">Neurology</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              <SelectItem value="Dermatology">Dermatology</SelectItem>
              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`p-2 cursor-pointer ${
                selectedDoctor === doctor.name ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onClick={() => setSelectedDoctor(doctor.name)}
            >
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleAssign} disabled={!selectedDoctor || isAssigning}>
          {isAssigning ? "Assigning..." : "Assign Doctor"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
