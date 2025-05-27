"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const patients = [
  {
    id: 1,
    name: "Jane Doe",
    image: "/placeholder.svg?height=100&width=100&text=JD",
    lastAccessed: "2023-05-15",
    recordCount: 5,
    sex: "Female",
    bloodGroup: "A+",
  },
  {
    id: 2,
    name: "John Smith",
    image: "/placeholder.svg?height=100&width=100&text=JS",
    lastAccessed: "2023-05-14",
    recordCount: 3,
    sex: "Male",
    bloodGroup: "O-",
  },
  {
    id: 3,
    name: "Emily Johnson",
    image: "/placeholder.svg?height=100&width=100&text=EJ",
    lastAccessed: "2023-05-13",
    recordCount: 7,
    sex: "Female",
    bloodGroup: "B+",
  },
  {
    id: 4,
    name: "Michael Brown",
    image: "/placeholder.svg?height=100&width=100&text=MB",
    lastAccessed: "2023-05-12",
    recordCount: 2,
    sex: "Male",
    bloodGroup: "AB-",
  },
  {
    id: 5,
    name: "Sarah Davis",
    image: "/placeholder.svg?height=100&width=100&text=SD",
    lastAccessed: "2023-05-11",
    recordCount: 4,
    sex: "Female",
    bloodGroup: "A-",
  },
  {
    id: 6,
    name: "David Wilson",
    image: "/placeholder.svg?height=100&width=100&text=DW",
    lastAccessed: "2023-05-10",
    recordCount: 6,
    sex: "Male",
    bloodGroup: "O+",
  },
  {
    id: 7,
    name: "Lisa Taylor",
    image: "/placeholder.svg?height=100&width=100&text=LT",
    lastAccessed: "2023-05-09",
    recordCount: 3,
    sex: "Female",
    bloodGroup: "B-",
  },
  {
    id: 8,
    name: "Robert Anderson",
    image: "/placeholder.svg?height=100&width=100&text=RA",
    lastAccessed: "2023-05-08",
    recordCount: 5,
    sex: "Male",
    bloodGroup: "AB+",
  },
]

export function PatientTiles() {
  const [currentPage, setCurrentPage] = useState(1)
  const patientsPerPage = 6

  const indexOfLastPatient = currentPage * patientsPerPage
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Patient Records</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="p-4 hover:bg-muted/50 transition-colors duration-200 rounded-lg border border-border">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={patient.image} alt={patient.name} />
                  <AvatarFallback>
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground">Last accessed: {patient.lastAccessed}</p>
                  <p className="text-sm text-foreground">Records: {patient.recordCount}</p>
                  <p className="text-sm text-foreground">
                    {patient.sex} | {patient.bloodGroup}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        {Array.from({ length: Math.ceil(patients.length / patientsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
