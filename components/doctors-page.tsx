"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreVertical, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const doctors = [
  {
    id: 1,
    name: "Dr. John Smith",
    image: "/placeholder.svg?height=100&width=100&text=JS",
    specialty: "Cardiology",
    patients: 120,
    email: "john.smith@example.com",
    phone: "+1 (555) 234-5678",
  },
  {
    id: 2,
    name: "Dr. Sarah Johnson",
    image: "/placeholder.svg?height=100&width=100&text=SJ",
    specialty: "Neurology",
    patients: 95,
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 876-5432",
  },
  {
    id: 3,
    name: "Dr. Michael Lee",
    image: "/placeholder.svg?height=100&width=100&text=ML",
    specialty: "Pediatrics",
    patients: 150,
    email: "michael.lee@example.com",
    phone: "+1 (555) 789-0123",
  },
  {
    id: 4,
    name: "Dr. Emily Chen",
    image: "/placeholder.svg?height=100&width=100&text=EC",
    specialty: "Dermatology",
    patients: 80,
    email: "emily.chen@example.com",
    phone: "+1 (555) 345-6789",
  },
  {
    id: 5,
    name: "Dr. David Brown",
    image: "/placeholder.svg?height=100&width=100&text=DB",
    specialty: "Orthopedics",
    patients: 110,
    email: "david.brown@example.com",
    phone: "+1 (555) 901-2345",
  },
  {
    id: 6,
    name: "Dr. Lisa Taylor",
    image: "/placeholder.svg?height=100&width=100&text=LT",
    specialty: "Obstetrics and Gynecology",
    patients: 130,
    email: "lisa.taylor@example.com",
    phone: "+1 (555) 678-9012",
  },
  {
    id: 7,
    name: "Dr. Robert Wilson",
    image: "/placeholder.svg?height=100&width=100&text=RW",
    specialty: "Psychiatry",
    patients: 75,
    email: "robert.wilson@example.com",
    phone: "+1 (555) 432-1098",
  },
  {
    id: 8,
    name: "Dr. Jennifer Martinez",
    image: "/placeholder.svg?height=100&width=100&text=JM",
    specialty: "Oncology",
    patients: 100,
    email: "jennifer.martinez@example.com",
    phone: "+1 (555) 210-9876",
  },
]

const specialties = [
  "All",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Dermatology",
  "Orthopedics",
  "Obstetrics and Gynecology",
  "Psychiatry",
  "Oncology",
]

export function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [specialtyFilter, setSpecialtyFilter] = useState("All")

  const doctorsPerPage = 6
  const indexOfLastDoctor = currentPage * doctorsPerPage
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (specialtyFilter === "All" || doctor.specialty === specialtyFilter),
  )

  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor)

  const handleDelete = (doctorName: string) => {
    if (deleteConfirmation === doctorName) {
      // Perform delete operation here
      console.log(`Deleting doctor: ${doctorName}`)
      setDoctorToDelete(null)
      setDeleteConfirmation("")
    }
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Doctors</h1>
      <div className="flex mb-6 space-x-4">
        <Input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentDoctors.map((doctor) => (
          <div key={doctor.id} className="p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doctor.image} alt={doctor.name} />
                  <AvatarFallback>
                    {doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View doctor</DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{doctor.name}</DialogTitle>
                        <DialogDescription>Doctor Information</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Avatar className="h-20 w-20 col-span-1">
                            <AvatarImage src={doctor.image} alt={doctor.name} />
                            <AvatarFallback>
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="col-span-3">
                            <p>
                              <strong>Specialty:</strong> {doctor.specialty}
                            </p>
                            <p>
                              <strong>Patients:</strong> {doctor.patients}
                            </p>
                            <p>
                              <strong>Email:</strong> {doctor.email}
                            </p>
                            <p>
                              <strong>Phone:</strong> {doctor.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button>View Doctor's Patients</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                        Delete doctor
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Doctor</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this doctor? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <p>Please type the doctor's name to confirm deletion:</p>
                        <Input
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder={`Type "${doctor.name}" to confirm`}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation("")}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(doctor.name)}
                          disabled={deleteConfirmation !== doctor.name}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        {Array.from({ length: Math.ceil(filteredDoctors.length / doctorsPerPage) }).map((_, index) => (
          <Button
            key={index}
            onClick={() => paginate(index + 1)}
            variant={currentPage === index + 1 ? "default" : "outline"}
            className="mx-1"
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  )
}
