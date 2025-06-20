"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, User, Mail, Phone, Calendar, Heart } from "lucide-react"
import { adminService } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"
import type { PatientListItem, PatientStatistics } from "@/services/admin.service"

const filters = [
  { name: "all", label: "All Fields" },
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone Number" },
]

const genderFilters = [
  { value: "all", label: "All Genders" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
]

const bloodTypeFilters = [
  { value: "all", label: "All Blood Types" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
]

export function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [genderFilter, setGenderFilter] = useState("all")
  const [bloodTypeFilter, setBloodTypeFilter] = useState("all")
  const [searchResults, setSearchResults] = useState<PatientListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [patientStatistics, setPatientStatistics] = useState<PatientStatistics | null>(null)
  const [statisticsLoading, setStatisticsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const patientsPerPage = 12

  useEffect(() => {
    loadPatientStatistics()
  }, [])

  const loadPatientStatistics = async () => {
    try {
      setStatisticsLoading(true)
      const statistics = await adminService.getPatientStatistics()
      setPatientStatistics(statistics)
    } catch (error) {
      console.error("Failed to load patient statistics:", error)
      // Don't show error toast for optional data
    } finally {
      setStatisticsLoading(false)
    }
  }

  const handleSearch = async (page: number = 1) => {
    try {
      setLoading(true)
      setHasSearched(true)
      setCurrentPage(page)

      // Build filter parameters
      const filters: any = {
        limit: patientsPerPage,
        offset: (page - 1) * patientsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      }

      // Add search term if provided
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim()
      }

      // Add gender filter if selected
      if (genderFilter && genderFilter !== "all") {
        filters.gender = genderFilter
      }

      // Add blood type filter if selected
      if (bloodTypeFilter && bloodTypeFilter !== "all") {
        filters.bloodType = bloodTypeFilter
      }

      console.log("Searching patients with filters:", filters)
      const data = await adminService.getPatients(filters)

      setSearchResults(data.patients)
      setTotalPatients(data.pagination.total)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Search failed:", error)
      toast({
        title: "Search Failed",
        description: "Failed to search patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setGenderFilter("all")
    setBloodTypeFilter("all")
    setSearchResults([])
    setHasSearched(false)
    setCurrentPage(1)
    setTotalPages(1)
    setTotalPatients(0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Patient Search</h2>
        {!statisticsLoading && patientStatistics && (
          <div className="text-sm text-muted-foreground">
            Total Patients: <span className="font-semibold text-foreground">{patientStatistics.overview.totalPatients}</span>
            {" • "}
            Active: <span className="font-semibold text-green-600">{patientStatistics.overview.activePatients}</span>
          </div>
        )}
      </div>
      {/* Enhanced Search Interface */}
      <div className="space-y-4 mb-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search patients by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleSearch(1)} disabled={loading} className="h-12 px-6">
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button
              onClick={handleClearSearch}
              variant="outline"
              disabled={loading}
              className="h-12 px-4"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <SelectValue placeholder="Filter by Gender" />
            </SelectTrigger>
            <SelectContent>
              {genderFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <SelectValue placeholder="Filter by Blood Type" />
            </SelectTrigger>
            <SelectContent>
              {bloodTypeFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Search Results ({totalPatients} total, showing {searchResults.length})
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No patients found matching your search criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search terms or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {searchResults.map((patient) => (
                  <Card key={patient._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src="" alt={`${patient.firstName} ${patient.lastName}`} />
                          <AvatarFallback>
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground truncate">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            <Badge variant={patient.isActive ? "default" : "secondary"} className="text-xs">
                              {patient.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{patient.emailAddress}</span>
                            </div>

                            {patient.phoneNumber && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-2 h-3 w-3 flex-shrink-0" />
                                <span>{patient.phoneNumber}</span>
                              </div>
                            )}

                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground">
                              <Heart className="mr-2 h-3 w-3 flex-shrink-0" />
                              <span>{patient.bloodType}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {patient.gender}
                              </Badge>
                              {patient.admission?.department && (
                                <Badge variant="outline" className="text-xs">
                                  {patient.admission.department}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ID: {patient._id.slice(-8)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSearch(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
