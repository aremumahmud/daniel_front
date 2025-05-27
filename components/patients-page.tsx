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
import Link from "next/link"
import { AddRecordDialog } from "./add-record-dialog"
import { AssignDoctorDialog } from "./assign-doctor-dialog"

const patients = [
  {
    id: 1,
    name: "Jane Doe",
    image: "/placeholder.svg?height=100&width=100&text=JD",
    lastAccessed: "2023-05-15",
    recordCount: 5,
    sex: "Female",
    bloodGroup: "A+",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    name: "John Smith",
    image: "/placeholder.svg?height=100&width=100&text=JS",
    lastAccessed: "2023-05-14",
    recordCount: 3,
    sex: "Male",
    bloodGroup: "O-",
    email: "john.smith@example.com",
    phone: "+1 (555) 987-6543",
  },
  {
    id: 3,
    name: "Emily Johnson",
    image: "/placeholder.svg?height=100&width=100&text=EJ",
    lastAccessed: "2023-05-13",
    recordCount: 7,
    sex: "Female",
    bloodGroup: "B+",
    email: "emily.johnson@example.com",
    phone: "+1 (555) 246-8135",
  },
  {
    id: 4,
    name: "Michael Brown",
    image: "/placeholder.svg?height=100&width=100&text=MB",
    lastAccessed: "2023-05-12",
    recordCount: 2,
    sex: "Male",
    bloodGroup: "AB-",
    email: "michael.brown@example.com",
    phone: "+1 (555) 369-2580",
  },
  {
    id: 5,
    name: "Sarah Davis",
    image: "/placeholder.svg?height=100&width=100&text=SD",
    lastAccessed: "2023-05-11",
    recordCount: 4,
    sex: "Female",
    bloodGroup: "A-",
    email: "sarah.davis@example.com",
    phone: "+1 (555) 147-2589",
  },
  {
    id: 6,
    name: "David Wilson",
    image: "/placeholder.svg?height=100&width=100&text=DW",
    lastAccessed: "2023-05-10",
    recordCount: 6,
    sex: "Male",
    bloodGroup: "O+",
    email: "david.wilson@example.com",
    phone: "+1 (555) 753-9514",
  },
  {
    id: 7,
    name: "Lisa Taylor",
    image: "/placeholder.svg?height=100&width=100&text=LT",
    lastAccessed: "2023-05-09",
    recordCount: 3,
    sex: "Female",
    bloodGroup: "B-",
    email: "lisa.taylor@example.com",
    phone: "+1 (555) 951-7532",
  },
  {
    id: 8,
    name: "Robert Anderson",
    image: "/placeholder.svg?height=100&width=100&text=RA",
    lastAccessed: "2023-05-08",
    recordCount: 5,
    sex: "Male",
    bloodGroup: "AB+",
    email: "robert.anderson@example.com",
    phone: "+1 (555) 357-1593",
  },
  {
    id: 9,
    name: "Jennifer Martinez",
    image: "/placeholder.svg?height=100&width=100&text=JM",
    lastAccessed: "2023-05-07",
    recordCount: 4,
    sex: "Female",
    bloodGroup: "A+",
    email: "jennifer.martinez@example.com",
    phone: "+1 (555) 852-9630",
  },
  {
    id: 10,
    name: "William Thompson",
    image: "/placeholder.svg?height=100&width=100&text=WT",
    lastAccessed: "2023-05-06",
    recordCount: 2,
    sex: "Male",
    bloodGroup: "O-",
    email: "william.thompson@example.com",
    phone: "+1 (555) 741-8520",
  },
]

export function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sexFilter, setSexFilter] = useState("all")
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all")

  const patientsPerPage = 6
  const indexOfLastPatient = currentPage * patientsPerPage
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (sexFilter === "all" || patient.sex.toLowerCase() === sexFilter.toLowerCase()) &&
      (bloodGroupFilter === "all" || patient.bloodGroup === bloodGroupFilter),
  )

  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient)

  const handleDelete = (patientName: string) => {
    if (deleteConfirmation === patientName) {
      // Perform delete operation here
      console.log(`Deleting patient: ${patientName}`)
      setPatientToDelete(null)
      setDeleteConfirmation("")
    }
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Patients</h1>
      <div className="flex mb-6 space-x-4">
        <Input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={sexFilter} onValueChange={setSexFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Sex" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Blood Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
          </SelectContent>
        </Select>
        <Button>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
        <Button asChild className="ml-auto">
          <Link href="/dashboard/patients/new">Add New Patient</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentPatients.map((patient) => (
          <div key={patient.id} className="p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={patient.image} alt={patient.name} />
                  <AvatarFallback>
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">Records: {patient.recordCount}</p>
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
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View patient</DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{patient.name}</DialogTitle>
                        <DialogDescription>Patient Information</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Avatar className="h-20 w-20 col-span-1">
                            <AvatarImage src={patient.image} alt={patient.name} />
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="col-span-3">
                            <p>
                              <strong>Email:</strong> {patient.email}
                            </p>
                            <p>
                              <strong>Phone:</strong> {patient.phone}
                            </p>
                            <p>
                              <strong>Sex:</strong> {patient.sex}
                            </p>
                            <p>
                              <strong>Blood Group:</strong> {patient.bloodGroup}
                            </p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button asChild>
                          <Link href={`/dashboard/patients/${patient.id}/records`}>View Patient Records</Link>
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Add record</DropdownMenuItem>
                    </DialogTrigger>
                    <AddRecordDialog patientId={patient.id} patientName={patient.name} />
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Assign to doctor</DropdownMenuItem>
                    </DialogTrigger>
                    <AssignDoctorDialog patientId={patient.id} patientName={patient.name} />
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                        Delete patient
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Patient</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this patient? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <p>Please type the patient's name to confirm deletion:</p>
                        <Input
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          placeholder={`Type "${patient.name}" to confirm`}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation("")}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(patient.name)}
                          disabled={deleteConfirmation !== patient.name}
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
        {Array.from({ length: Math.ceil(filteredPatients.length / patientsPerPage) }).map((_, index) => (
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
