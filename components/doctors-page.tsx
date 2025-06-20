"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreVertical, Search, Mail, Phone, User } from "lucide-react"
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
import { adminService } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"
import type { User } from "@/lib/types/api"
import type { DoctorResponse } from "@/services/admin.service"
import { CreateDoctorDialog } from "@/components/create-doctor-dialog"

export function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [doctorToDelete, setDoctorToDelete] = useState<DoctorResponse | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDoctors, setTotalDoctors] = useState(0)
  const [specializationFilter, setSpecializationFilter] = useState("All")
  const [availabilityFilter, setAvailabilityFilter] = useState("All")
  const [deleting, setDeleting] = useState(false)

  const doctorsPerPage = 6

  useEffect(() => {
    loadDoctors()
  }, [currentPage, searchTerm, specializationFilter, availabilityFilter])

  const loadDoctors = async () => {
    try {
      setLoading(true)

      // Try the new doctors API first, fallback to users API if it fails
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: doctorsPerPage,
          sortBy: "createdAt",
          sortOrder: "desc",
        }

        // Only add optional parameters if they have values
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim()
        }

        if (specializationFilter && specializationFilter !== "All") {
          params.specialization = specializationFilter
        }

        if (availabilityFilter && availabilityFilter !== "All") {
          params.isAvailable = availabilityFilter === "Available"
        }

        const data = await adminService.getDoctors(params)
        console.log("Doctors API response:", data)
        setDoctors(data.doctors)
        setTotalPages(data.pagination.totalPages)
        setTotalDoctors(data.pagination.totalDoctors)
      } catch (doctorApiError) {
        console.warn("Doctors API failed, falling back to users API:", doctorApiError)

        // Fallback to users API
        const params: Record<string, any> = {
          role: "doctor",
          limit: doctorsPerPage,
          page: currentPage,
        }

        // Only add optional parameters if they have values
        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim()
        }

        if (availabilityFilter && availabilityFilter !== "All") {
          params.status = availabilityFilter === "Available" ? "active" : "inactive"
        }

        const userData = await adminService.getUsers(params)
        console.log("Users API fallback response:", userData)

        // Transform User[] to DoctorResponse[]
        const transformedDoctors: DoctorResponse[] = userData.users.map(user => ({
          _id: user._id,
          userId: user,
          licenseNumber: `LIC-${user._id.slice(-6)}`, // Generate a license number
          specialization: "General Medicine", // Default specialization
          isAvailable: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))

        console.log("Transformed doctors:", transformedDoctors)
        setDoctors(transformedDoctors)
        setTotalPages(userData.totalPages || Math.ceil(userData.total / doctorsPerPage))
        setTotalDoctors(userData.total)
      }
    } catch (error) {
      console.error("Failed to load doctors:", error)
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadDoctors()
  }

  const handleDelete = async (doctor: DoctorResponse) => {
    const doctorName = typeof doctor.userId === 'object'
      ? `${doctor.userId.firstName} ${doctor.userId.lastName}`
      : `Doctor ${doctor.licenseNumber}`

    if (deleteConfirmation === doctorName && doctorToDelete) {
      try {
        setDeleting(true)
        await adminService.deleteDoctor(doctorToDelete._id)
        toast({
          title: "Success",
          description: `Doctor ${doctorName} has been deleted`,
        })
        setDoctorToDelete(null)
        setDeleteConfirmation("")
        loadDoctors() // Reload the list
      } catch (error) {
        console.error("Failed to delete doctor:", error)
        toast({
          title: "Error",
          description: "Failed to delete doctor",
          variant: "destructive",
        })
      } finally {
        setDeleting(false)
      }
    }
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const formatDate = (dateString: Date | undefined) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Doctors</h1>
        <div className="flex mb-6 space-x-4">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Doctors ({totalDoctors} total)</h1>
        <CreateDoctorDialog onDoctorCreated={loadDoctors} />
      </div>
      {/* Responsive Search and Filter Section */}
      <div className="space-y-4 mb-6">
        {/* Search Bar - Full width on mobile */}
        <div className="w-full">
          <Input
            type="text"
            placeholder="Search by name, license, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full"
          />
        </div>

        {/* Filters - Stack on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Specializations</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Dermatology">Dermatology</SelectItem>
              <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
              <SelectItem value="Family Medicine">Family Medicine</SelectItem>
              <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
              <SelectItem value="Neurology">Neurology</SelectItem>
              <SelectItem value="Obstetrics & Gynecology">Obstetrics & Gynecology</SelectItem>
              <SelectItem value="Oncology">Oncology</SelectItem>
              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              <SelectItem value="Psychiatry">Psychiatry</SelectItem>
              <SelectItem value="Radiology">Radiology</SelectItem>
              <SelectItem value="Surgery">Surgery</SelectItem>
              <SelectItem value="Urology">Urology</SelectItem>
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Doctors</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            <span className="sm:inline">Search</span>
          </Button>
        </div>
      </div>
      {doctors.length === 0 ? (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No doctors found matching your criteria.</p>
        </div>
      ) : (
        /* Responsive Grid - 1 column on mobile, 2 on tablet, 3 on desktop */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => {
            const userData = typeof doctor.userId === 'object' ? doctor.userId : null
            const doctorName = userData ? `${userData.firstName} ${userData.lastName}` : `Doctor ${doctor.licenseNumber}`
            const doctorEmail = userData?.email || 'No email available'
            const isActive = userData?.isActive ?? true

            return (
              <div key={doctor._id} className="p-4 rounded-lg border border-border hover:shadow-md transition-shadow bg-card">
                {/* Card Header with Avatar and Actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src="" alt={doctorName} />
                      <AvatarFallback>
                        {userData ? `${userData.firstName[0]}${userData.lastName[0]}` : 'DR'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate" title={doctorName}>
                        {doctorName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate" title={doctorEmail}>
                        {doctorEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="space-y-2">
                  {/* Specialization */}
                  <p className="text-sm font-medium text-foreground truncate" title={doctor.specialization}>
                    {doctor.specialization}
                  </p>

                  {/* License Number */}
                  {doctor.licenseNumber && (
                    <p className="text-xs text-muted-foreground truncate">
                      License: {doctor.licenseNumber}
                    </p>
                  )}

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                    {doctor.isAvailable && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        Available
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {doctor.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">⭐ {doctor.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({doctor.totalReviews} reviews)
                      </span>
                    </div>
                  )}

                  {/* Consultation Fee */}
                  {doctor.consultationFee && (
                    <p className="text-sm font-medium text-green-600">
                      ${doctor.consultationFee} consultation
                    </p>
                  )}
                </div>

                {/* Actions Menu - Positioned at bottom right */}
                <div className="flex justify-end mt-3 pt-3 border-t border-border">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>View doctor</DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-lg sm:text-xl">{doctorName}</DialogTitle>
                          <DialogDescription>Doctor Information</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
                              <AvatarImage src="" alt={doctorName} />
                              <AvatarFallback className="text-lg">
                                {userData ? `${userData.firstName[0]}${userData.lastName[0]}` : 'DR'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3 w-full">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                  <p className="text-sm">{doctorName}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                                  <Badge variant={isActive ? "default" : "secondary"}>
                                    {isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                    <p className="text-sm truncate">{doctorEmail}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">License Number</p>
                                  <p className="text-sm">{doctor.licenseNumber}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                                  <p className="text-sm">{doctor.specialization}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                                  <Badge variant={doctor.isAvailable ? "default" : "secondary"} className="text-xs">
                                    {doctor.isAvailable ? "Available" : "Unavailable"}
                                  </Badge>
                                </div>
                              </div>
                              {doctor.department && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                                  <p className="text-sm">{doctor.department}</p>
                                </div>
                              )}
                              {doctor.yearsExperience && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Years of Experience</p>
                                  <p className="text-sm">{doctor.yearsExperience} years</p>
                                </div>
                              )}
                              {doctor.consultationFee && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Consultation Fee</p>
                                  <p className="text-sm">${doctor.consultationFee}</p>
                                </div>
                              )}
                              {doctor.rating && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                                  <p className="text-sm">⭐ {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p className="text-sm">{formatDate(doctor.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">View Doctor's Patients</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            setDoctorToDelete(doctor)
                            setDeleteConfirmation("")
                          }}
                          className="text-red-600"
                        >
                          Delete doctor
                        </DropdownMenuItem>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Doctor</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this doctor? This action cannot be undone and will remove all associated data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="" alt={doctorName} />
                              <AvatarFallback>
                                {userData ? `${userData.firstName[0]}${userData.lastName[0]}` : 'DR'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{doctorName}</p>
                              <p className="text-sm text-muted-foreground">{doctorEmail}</p>
                              <p className="text-sm text-muted-foreground">License: {doctor.licenseNumber}</p>
                            </div>
                          </div>
                          <p className="text-sm">Please type the doctor's full name to confirm deletion:</p>
                          <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder={`Type "${doctorName}" to confirm`}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDoctorToDelete(null)
                              setDeleteConfirmation("")
                            }}
                            disabled={deleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(doctor)}
                            disabled={deleteConfirmation !== doctorName || deleting}
                          >
                            {deleting ? "Deleting..." : "Delete Doctor"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* Responsive Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap justify-center gap-1">
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                onClick={() => paginate(index + 1)}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
                className="min-w-[40px]"
                disabled={loading}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
