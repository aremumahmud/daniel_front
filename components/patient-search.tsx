"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const filters = [
  { name: "surname", label: "Surname" },
  { name: "lastname", label: "Last Name" },
  { name: "bloodGroup", label: "Blood Group" },
  { name: "sex", label: "Sex" },
  { name: "bloodType", label: "Blood Type" },
]

export function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("surname")

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Patient Search</h2>
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12"
          />
        </div>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[180px] h-12">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            {filters.map((filter) => (
              <SelectItem key={filter.name} value={filter.name}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="h-12 px-6">Search</Button>
      </div>
    </div>
  )
}
