"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Heart, Mail, Phone, User, Users } from "lucide-react"
import { adminService } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"
import type { PatientListItem } from "@/services/admin.service"

export function PatientTiles() {
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const patientsPerPage = 9

  useEffect(() => {
    loadRecentPatients()
  }, [currentPage])

  const loadRecentPatients = async () => {
    try {
      setLoading(true)

      // Use the dedicated patients API with proper filtering
      const filters = {
        limit: patientsPerPage,
        offset: (currentPage - 1) * patientsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc" as const,
        isActive: true, // Only show active patients by default
      }

      console.log("Loading patients with filters:", filters)
      const data = await adminService.getPatients(filters)

      setPatients(data.patients)
      setTotalPages(data.pagination.pages)
      setTotalPatients(data.pagination.total)
    } catch (error) {
      console.error("Failed to load patients:", error)

      // Fallback to users API if patients API fails
      try {
        console.warn("Patients API failed, falling back to users API")
        const fallbackData = await adminService.getUsers({
          role: "patient",
          limit: patientsPerPage,
          page: currentPage,
        })

        // Transform User data to PatientListItem format
        const transformedPatients: PatientListItem[] = fallbackData.users.map(user => ({
          _id: user._id,
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddress: user.email,
          phoneNumber: user.phone || "",
          dateOfBirth: "1990-01-01", // Default date
          gender: "other" as const,
          bloodType: "O+",
          admission: { department: "General" },
          isActive: user.isActive,
          createdAt: user.createdAt?.toString() || new Date().toISOString(),
        }))

        setPatients(transformedPatients)
        setTotalPages(fallbackData.totalPages || Math.ceil(fallbackData.total / patientsPerPage))
        setTotalPatients(fallbackData.total)
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const formatDate = (dateString: Date | undefined) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Recent Patients</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Recent Patients</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Total: {totalPatients}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Showing: {patients.length}</span>
          </div>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No patients found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Patients will appear here once they are registered.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {patients.map((patient, index) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="p-4 hover:shadow-md transition-all duration-200 rounded-lg border border-border cursor-pointer bg-card">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-14 w-14 flex-shrink-0">
                      <AvatarImage src="" alt={`${patient.firstName} ${patient.lastName}`} />
                      <AvatarFallback>
                        {patient.firstName[0]}{patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-base text-foreground truncate">
                          {patient.firstName} {patient.lastName}
                        </h3>
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
                          {formatDate(new Date(patient.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
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
                      onClick={() => paginate(page)}
                      disabled={loading}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                })}

                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(totalPages)}
                      disabled={loading}
                      className="min-w-[40px]"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
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
  )
}
