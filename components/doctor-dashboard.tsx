"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Activity, Bell, Plus, Search, Filter, Clock, MapPin, Phone, Mail, Star, TrendingUp, DollarSign, MessageSquare, Settings, Stethoscope, Edit } from "lucide-react"
import { DoctorSideNav } from "@/components/doctor-side-nav"
import { DoctorAppointments } from "@/components/doctor-appointments"
import { DoctorSettingsPage } from "@/components/doctor-settings-page"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { doctorService } from "@/services/doctor.service"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import type { DoctorDashboard as DoctorDashboardType, Patient, Doctor } from "@/lib/types/api"

// Medical Records Component
function DoctorMedicalRecords() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [recordType, setRecordType] = useState("all")

  useEffect(() => {
    loadMedicalRecords()
  }, [selectedPatient, recordType])

  const loadMedicalRecords = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 20, page: 1 }
      if (selectedPatient) params.patientId = selectedPatient
      if (recordType !== "all") params.recordType = recordType

      const data = await doctorService.getMedicalRecords(params)
      setRecords(data.records)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load medical records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by patient..."
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="max-w-sm"
        />
        <Select value={recordType} onValueChange={setRecordType}>
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Record type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="lab-result">Lab Results</SelectItem>
            <SelectItem value="prescription">Prescription</SelectItem>
            <SelectItem value="diagnosis">Diagnosis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{record.recordType}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.visitDate).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold">{record.patient?.userId?.fullName}</h3>
                    <p className="text-sm text-muted-foreground">{record.chiefComplaint}</p>
                    <p className="text-sm">{record.diagnosis?.[0]?.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Messages Component
function DoctorMessages() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await doctorService.getMessages()
      setConversations(data.conversations)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Badge variant="secondary">
          {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)} unread
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Card key={conversation._id} className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={conversation.patient?.userId?.avatarUrl} />
                    <AvatarFallback>
                      {conversation.patient?.userId?.fullName?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{conversation.patient?.userId?.fullName}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.lastMessage?.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {conversation.lastMessage?.content}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// Doctor Patients Component
function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [schedulePatient, setSchedulePatient] = useState<Patient | null>(null)

  useEffect(() => {
    loadPatients()
  }, [searchTerm])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const data = await doctorService.getPatients({ search: searchTerm, limit: 20, page: 1 })
      setPatients(data.patients)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewPatient = async (patient: Patient) => {
    try {
      const response = await doctorService.getPatientDetails(patient._id)
      // Handle the API response structure: { success: true, data: { patient: {...}, medicalRecords: [...], appointments: [...] } }
      if (response.success && response.data && response.data.patient) {
        setSelectedPatient(response.data.patient)
      } else {
        // Fallback to direct patient data if structure is different
        setSelectedPatient(response.patient || response)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient details",
        variant: "destructive",
      })
    }
  }

  const handleScheduleAppointment = (patient: Patient) => {
    setSchedulePatient(patient)
    setIsScheduleDialogOpen(true)
  }

  const handleCreateAppointment = async (formData: FormData) => {
    try {
      const appointmentData = {
        patientId: schedulePatient?._id,
        appointmentDate: formData.get("date") as string,
        appointmentTime: formData.get("time") as string,
        durationMinutes: parseInt(formData.get("duration") as string) || 30,
        type: formData.get("type") as string,
        reason: formData.get("reason") as string,
        notes: formData.get("notes") as string,
        priority: formData.get("priority") as string || "medium",
        location: formData.get("location") as string || "clinic",
      }

      await doctorService.createAppointment(appointmentData)

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      })

      setIsScheduleDialogOpen(false)
      setSchedulePatient(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Patients</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            My Patients Only
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search patients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {patients.map((patient) => (
            <Card key={patient._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={patient.userId?.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        {patient.userId?.firstName?.[0]}
                        {patient.userId?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{patient.userId?.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age: {patient.age} • {patient.gender}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last visit:{" "}
                        {patient.userId?.lastLogin ? new Date(patient.userId.lastLogin).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {patient.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPatient(patient)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleScheduleAppointment(patient)}
                      >
                        Schedule Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedPatient?.userId?.fullName || `${selectedPatient?.firstName} ${selectedPatient?.lastName}`}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-xl">
                        {selectedPatient.firstName?.[0]}
                        {selectedPatient.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {selectedPatient.userId?.fullName || `${selectedPatient.firstName} ${selectedPatient.middleName ? selectedPatient.middleName + ' ' : ''}${selectedPatient.lastName}`}
                      </h2>
                      <p className="text-muted-foreground">
                        {selectedPatient.age || 'Age not calculated'} years old • {selectedPatient.gender} • {selectedPatient.bloodType}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{selectedPatient.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{selectedPatient.emailAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={selectedPatient.isActive ? "default" : "secondary"}>
                          {selectedPatient.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          Patient since {new Date(selectedPatient.createdAt).toLocaleDateString()}
                        </Badge>
                        {selectedPatient.maritalStatus && (
                          <Badge variant="outline">
                            {selectedPatient.maritalStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p>{selectedPatient.firstName} {selectedPatient.middleName} {selectedPatient.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                        <p>{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Marital Status</Label>
                        <p>{selectedPatient.maritalStatus || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                        <p>{selectedPatient.nationality || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                        <p>{selectedPatient.occupation || "Not specified"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Language</Label>
                        <p>{selectedPatient.languageSpoken || "Not specified"}</p>
                      </div>
                    </div>
                    {selectedPatient.homeAddress && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p className="text-sm">{selectedPatient.homeAddress}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPatient.medicalHistory && (
                      <>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Allergies</Label>
                          <p className="text-sm">
                            {selectedPatient.medicalHistory.allergies?.length > 0
                              ? selectedPatient.medicalHistory.allergies.join(", ")
                              : "None reported"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Chronic Conditions</Label>
                          <p className="text-sm">
                            {selectedPatient.medicalHistory.chronicIllnesses?.length > 0
                              ? selectedPatient.medicalHistory.chronicIllnesses.join(", ")
                              : "None reported"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Current Medications</Label>
                          <p className="text-sm">
                            {selectedPatient.medicalHistory.currentMedications?.length > 0
                              ? selectedPatient.medicalHistory.currentMedications.join(", ")
                              : "None reported"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Past Surgeries</Label>
                          <p className="text-sm">
                            {selectedPatient.medicalHistory.pastSurgeries?.length > 0
                              ? selectedPatient.medicalHistory.pastSurgeries.join(", ")
                              : "None reported"
                            }
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Family History</Label>
                          <p className="text-sm">
                            {selectedPatient.medicalHistory.familyHistory || "None reported"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Smoking Status</Label>
                            <p className="text-sm capitalize">
                              {selectedPatient.medicalHistory.smokingStatus || "Unknown"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Alcohol Consumption</Label>
                            <p className="text-sm capitalize">
                              {selectedPatient.medicalHistory.alcoholConsumption || "Unknown"}
                            </p>
                          </div>
                        </div>
                        {selectedPatient.medicalHistory.vaccinationHistory && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Vaccination History</Label>
                            <p className="text-sm">
                              {selectedPatient.medicalHistory.vaccinationHistory}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Vital Signs */}
                {selectedPatient.enhancedVitalSigns && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Latest Vital Signs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Blood Pressure</Label>
                          <p className="text-lg font-semibold">{selectedPatient.enhancedVitalSigns.bloodPressure}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Heart Rate</Label>
                          <p className="text-lg font-semibold">{selectedPatient.enhancedVitalSigns.heartRate} bpm</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Temperature</Label>
                          <p className="text-lg font-semibold">{selectedPatient.enhancedVitalSigns.temperature}°C</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Oxygen Saturation</Label>
                          <p className="text-lg font-semibold">{selectedPatient.enhancedVitalSigns.oxygenSaturation}%</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                          <p className="text-lg font-semibold">{selectedPatient.enhancedVitalSigns.weight} kg</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Height</Label>
                          <p className="text-lg font-semibold">{selectedPatient.enhancedVitalSigns.height} m</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Contact */}
                {selectedPatient.emergencyContact && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                          <p>{selectedPatient.emergencyContact.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                          <p>{selectedPatient.emergencyContact.phone}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Relationship</Label>
                          <p className="capitalize">{selectedPatient.emergencyContact.relationship}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Insurance Information */}
                {selectedPatient.insurance && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Insurance Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Provider</Label>
                          <p>{selectedPatient.insurance.provider || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Policy Number</Label>
                          <p>{selectedPatient.insurance.policyNumber || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Payment Type</Label>
                          <p className="capitalize">{selectedPatient.insurance.paymentType || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Billing Address</Label>
                          <p>{selectedPatient.insurance.billingAddress || "Not specified"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Admission Information */}
              {selectedPatient.admission && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Admission</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date of Admission</Label>
                        <p>{new Date(selectedPatient.admission.dateOfAdmission).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Doctor Assigned</Label>
                        <p className="capitalize">{selectedPatient.admission.doctorAssigned}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                        <p className="capitalize">{selectedPatient.admission.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Follow-up Date</Label>
                        <p>{new Date(selectedPatient.admission.followUpDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Symptoms/Complaints</Label>
                      <p className="text-sm">{selectedPatient.admission.symptomsComplaints}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Provisional Diagnosis</Label>
                      <p className="text-sm">{selectedPatient.admission.provisionalDiagnosis}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Treatment Plan</Label>
                      <p className="text-sm">{selectedPatient.admission.treatmentPlan}</p>
                    </div>
                    {selectedPatient.admission.labTestsOrdered?.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Lab Tests Ordered</Label>
                        <p className="text-sm">{selectedPatient.admission.labTestsOrdered.join(", ")}</p>
                      </div>
                    )}
                    {selectedPatient.admission.proceduresPerformed?.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Procedures Performed</Label>
                        <p className="text-sm">{selectedPatient.admission.proceduresPerformed.join(", ")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Test Results */}
              {selectedPatient.testResults && selectedPatient.testResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Test Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPatient.testResults.map((test: any, index: number) => (
                        <div key={test._id || index} className="border rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Test Name</Label>
                              <p className="font-medium">{test.testName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Test Date</Label>
                              <p>{new Date(test.testDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Label className="text-sm font-medium text-muted-foreground">Result</Label>
                            <p>{test.testResult}</p>
                          </div>
                          {test.doctorComments && (
                            <div className="mt-2">
                              <Label className="text-sm font-medium text-muted-foreground">Doctor Comments</Label>
                              <p className="text-sm">{test.doctorComments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Discharge Summary */}
              {selectedPatient.dischargeSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Discharge Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Discharge Date</Label>
                        <p>{new Date(selectedPatient.dischargeSummary.dischargeDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Next Follow-up</Label>
                        <p>{new Date(selectedPatient.dischargeSummary.nextFollowUp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Final Diagnosis</Label>
                      <p>{selectedPatient.dischargeSummary.finalDiagnosis}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Medications for Home</Label>
                      <p>{selectedPatient.dischargeSummary.medicationsForHome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Discharge Instructions</Label>
                      <p>{selectedPatient.dischargeSummary.dischargeInstructions}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Statistics */}
              {selectedPatient.statistics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedPatient.statistics.totalAppointments}</div>
                        <div className="text-sm text-muted-foreground">Total Appointments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedPatient.statistics.completedAppointments}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedPatient.statistics.cancelledAppointments}</div>
                        <div className="text-sm text-muted-foreground">Cancelled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedPatient.statistics.totalMedicalRecords}</div>
                        <div className="text-sm text-muted-foreground">Medical Records</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handleScheduleAppointment(selectedPatient)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Medical History
                </Button>
                <Button variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Patient Info
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment for {schedulePatient?.userId?.fullName || `${schedulePatient?.firstName} ${schedulePatient?.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleCreateAppointment(new FormData(e.currentTarget))
          }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select name="duration" defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select name="type" defaultValue="consultation">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="check-up">Check-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select name="location" defaultValue="clinic">
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Appointment</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  placeholder="Describe the reason for this appointment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional notes or instructions"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Schedule Appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Schedule Component
function DoctorSchedule() {
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    try {
      setLoading(true)
      const data = await doctorService.getSchedule()
      setSchedule(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSlots = async (date: string) => {
    try {
      const slots = await doctorService.getAvailableSlots(date)
      return slots
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available slots",
        variant: "destructive",
      })
      return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Working Hours
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Block Time
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>Your availability for the week</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {schedule?.schedule && Object.entries(schedule.schedule).map(([day, daySchedule]: [string, any]) => (
                  <div key={day} className="flex items-center justify-between p-3 border rounded">
                    <div className="font-medium capitalize">{day}</div>
                    <div className="text-sm text-muted-foreground">
                      {daySchedule.isAvailable
                        ? `${daySchedule.startTime} - ${daySchedule.endTime}`
                        : "Not available"
                      }
                    </div>
                    <Badge variant={daySchedule.isAvailable ? "default" : "secondary"}>
                      {daySchedule.isAvailable ? "Available" : "Off"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Exceptions</CardTitle>
            <CardDescription>Special dates and modifications</CardDescription>
          </CardHeader>
          <CardContent>
            {schedule?.exceptions?.length > 0 ? (
              <div className="space-y-3">
                {schedule.exceptions.map((exception: any) => (
                  <div key={exception._id} className="p-3 border rounded">
                    <div className="font-medium">{new Date(exception.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{exception.reason}</div>
                    <Badge variant={exception.isAvailable ? "default" : "destructive"} className="mt-1">
                      {exception.isAvailable ? "Modified Hours" : "Unavailable"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No schedule exceptions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState<DoctorDashboardType | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadDashboardData()
    loadDoctorProfile()
    loadNotifications()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await doctorService.getDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to load dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDoctorProfile = async () => {
    try {
      const profile = await doctorService.getProfile()
      setDoctorProfile(profile)
      console.log("Doctor profile loaded:", profile) // Debug log
    } catch (error) {
      console.error("Failed to load doctor profile:", error)
      // Don't show error toast for profile loading failure - it's not critical
      // The dashboard will still work with basic user info
    }
  }

  const loadNotifications = async () => {
    try {
      const data = await doctorService.getNotifications({ limit: 10 })
      setNotifications(data.notifications)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
  }

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await doctorService.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return <DoctorAppointments />
      case "patients":
        return <DoctorPatients />
      case "records":
        return <DoctorMedicalRecords />
      case "schedule":
        return <DoctorSchedule />
      case "messages":
        return <DoctorMessages />
      case "settings":
        return <DoctorSettingsPage />
      default:
        return (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},
                  Dr. {doctorProfile?.userId?.lastName || user?.lastName || "Doctor"}
                </h1>
                <p className="text-muted-foreground">
                  You have {dashboardData?.todaysAppointments?.length || 0} appointments today
                  {doctorProfile?.specialization && ` • ${doctorProfile.specialization}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                      <Badge variant="destructive" className="ml-2">
                        {notifications.filter((n) => !n.isRead).length}
                      </Badge>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Notifications</DialogTitle>
                      <DialogDescription>Recent alerts and updates</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                            onClick={() => handleMarkNotificationAsRead(notification._id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={notification.isRead ? "outline" : "default"}>
                                  {notification.type}
                                </Badge>
                                {notification.priority === 'high' && (
                                  <Badge variant="destructive">High Priority</Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            {notification.actionText && (
                              <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                                {notification.actionText}
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No notifications available</p>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => doctorService.markAllNotificationsAsRead().then(loadNotifications)}
                      >
                        Mark All as Read
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {notifications.filter(n => !n.isRead).length} unread
                      </span>
                    </div>
                  </DialogContent>
                </Dialog>

                {doctorProfile && (
                  <div className="flex items-center gap-2">
                    <Badge variant={doctorProfile.isAvailable ? "default" : "secondary"}>
                      {doctorProfile.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{doctorProfile.rating || "4.8"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-8 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData?.todaysAppointments?.length || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData?.statistics?.confirmedToday || 0} confirmed,{" "}
                        {dashboardData?.statistics?.pendingToday || 0} pending,{" "}
                        {dashboardData?.statistics?.completedToday || 0} completed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData?.statistics?.totalPatients || 0}</div>
                      <p className="text-xs text-muted-foreground">Active patients under care</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${dashboardData?.statistics?.monthlyRevenue?.toLocaleString() || "0"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        This month's earnings
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Patient Rating</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {dashboardData?.statistics?.averageRating || doctorProfile?.rating || "4.8"}
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Based on {doctorProfile?.totalReviews || "127"} reviews
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Today's Appointments */}
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Today's Appointments</CardTitle>
                      <CardDescription>Your scheduled appointments for today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardData?.todaysAppointments?.length ? (
                        dashboardData.todaysAppointments.map((appointment) => (
                          <div
                            key={appointment._id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={appointment.patient?.userId?.avatarUrl || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {appointment.patient?.userId?.firstName?.[0]}
                                  {appointment.patient?.userId?.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {appointment.patient?.userId?.fullName || `Patient ${appointment.patientId}`}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {appointment.type}
                                  </Badge>
                                  {appointment.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">
                                      High Priority
                                    </Badge>
                                  )}
                                  {appointment.isVirtual && (
                                    <Badge variant="secondary" className="text-xs">
                                      Virtual
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{appointment.appointmentTime}</span>
                              </div>
                              <Badge
                                variant={
                                  appointment.status === "confirmed"
                                    ? "default"
                                    : appointment.status === "urgent"
                                      ? "destructive"
                                      : appointment.status === "completed"
                                        ? "secondary"
                                        : "outline"
                                }
                              >
                                {appointment.status}
                              </Badge>
                              <div className="flex gap-1 mt-2">
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                                  View
                                </Button>
                                {appointment.status === "confirmed" && (
                                  <Button size="sm" className="h-7 px-2 text-xs">
                                    Start
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No appointments scheduled for today</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Patients */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Patients</CardTitle>
                      <CardDescription>Recently seen patients</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dashboardData?.recentPatients?.length ? (
                        dashboardData.recentPatients.map((patient) => (
                          <div key={patient._id} className="flex items-center space-x-3 p-3 rounded-lg border">
                            <Avatar>
                              <AvatarImage src={patient.userId?.avatarUrl || "/placeholder.svg"} />
                              <AvatarFallback>
                                {patient.userId?.firstName?.[0]}
                                {patient.userId?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{patient.userId?.fullName}</p>
                              <p className="text-sm text-muted-foreground">Age: {patient.age}</p>
                            </div>
                            <Badge variant="outline">Active</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No recent patients</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </>
        )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <DoctorSideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
}
