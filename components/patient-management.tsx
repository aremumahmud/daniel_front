"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { adminService, type PatientListItem, type PatientFilters, type PatientListResponse } from "@/services/admin.service"
import { Search, Filter, Plus, Eye, Edit, Trash2, Users, UserCheck, UserX } from "lucide-react"

interface PatientManagementProps {
  onViewPatient?: (patientId: string) => void
  onEditPatient?: (patientId: string) => void
}

export function PatientManagement({ onViewPatient, onEditPatient }: PatientManagementProps) {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    pages: 0
  })
  
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    gender: undefined,
    bloodType: undefined,
    department: undefined,
    isActive: undefined,
    limit: 20,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [showFilters, setShowFilters] = useState(false)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      console.log("Fetching patients with filters:", filters)
      
      const response = await adminService.getPatients(filters)
      console.log("Patients response:", response)
      
      setPatients(response.patients)
      setPagination(response.pagination)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [filters])

  const handleFilterChange = (key: keyof PatientFilters, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value === '' ? undefined : value,
      offset: 0 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }))
  }

  const handleViewPatient = (patientId: string) => {
    if (onViewPatient) {
      onViewPatient(patientId)
    } else {
      router.push(`/dashboard/patients/${patientId}`)
    }
  }

  const handleEditPatient = (patientId: string) => {
    if (onEditPatient) {
      onEditPatient(patientId)
    } else {
      router.push(`/dashboard/patients/${patientId}/edit`)
    }
  }

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (!confirm(`Are you sure you want to delete patient ${patientName}? This action cannot be undone.`)) {
      return
    }

    try {
      await adminService.deletePatient(patientId)
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      })
      fetchPatients() // Refresh the list
    } catch (error) {
      console.error("Failed to delete patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            Active
          </>
        ) : (
          <>
            <UserX className="w-3 h-3 mr-1" />
            Inactive
          </>
        )}
      </Badge>
    )
  }

  if (loading && patients.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patient Management</h2>
          <p className="text-muted-foreground">
            Manage and view all patients in the system
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/patients/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Search & Filter</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone number..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={filters.gender || ''}
                  onValueChange={(value) => handleFilterChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={filters.bloodType || ''}
                  onValueChange={(value) => handleFilterChange('bloodType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Blood Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Blood Types</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={filters.department || ''}
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.isActive?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">
            Showing {patients.length} of {pagination.total} patients
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {Math.floor(filters.offset! / filters.limit!) + 1} of {pagination.pages}
        </div>
      </div>

      {/* Patient List */}
      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card key={patient._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.emailAddress}
                      </p>
                    </div>
                    {getStatusBadge(patient.isActive)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Phone:</span>
                      <p className="text-muted-foreground">{patient.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span>
                      <p className="text-muted-foreground capitalize">{patient.gender}</p>
                    </div>
                    <div>
                      <span className="font-medium">Blood Type:</span>
                      <p className="text-muted-foreground">{patient.bloodType}</p>
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>
                      <p className="text-muted-foreground capitalize">
                        {patient.admission?.department || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Born: {formatDate(patient.dateOfBirth)}</span>
                    <span>•</span>
                    <span>Created: {formatDate(patient.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPatient(patient._id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPatient(patient._id)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePatient(patient._id, `${patient.firstName} ${patient.lastName}`)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {patients.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.gender || filters.bloodType || filters.department
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first patient"}
            </p>
            <Button onClick={() => router.push('/dashboard/patients/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.offset === 0}
              onClick={() => handlePageChange(Math.max(0, filters.offset! - filters.limit!))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.offset! + filters.limit! >= pagination.total}
              onClick={() => handlePageChange(filters.offset! + filters.limit!)}
            >
              Next
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="pageSize">Items per page:</Label>
            <Select
              value={filters.limit?.toString() || '20'}
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
