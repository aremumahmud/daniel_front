"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { adminService, type PatientDetails } from "@/services/admin.service"
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Activity, 
  FileText, 
  Calendar,
  Shield,
  AlertTriangle,
  Pill,
  Stethoscope,
  ClipboardList
} from "lucide-react"

interface PatientDetailsProps {
  patientId: string
  onEdit?: () => void
  onBack?: () => void
}

export function PatientDetails({ patientId, onEdit, onBack }: PatientDetailsProps) {
  const router = useRouter()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true)
        console.log("Fetching patient details for ID:", patientId)
        
        const patientData = await adminService.getPatientById(patientId)
        console.log("Patient details loaded:", patientData)
        
        setPatient(patientData)
      } catch (error) {
        console.error("Failed to fetch patient details:", error)
        toast({
          title: "Error",
          description: "Failed to load patient details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPatientDetails()
    }
  }, [patientId])

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      router.push(`/dashboard/patients/${patientId}/edit`)
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.push('/dashboard/patients')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Helper functions to handle different data structures
  const formatWeight = (weight: any) => {
    if (typeof weight === 'number') {
      return `${weight} kg`
    }
    if (weight && typeof weight === 'object' && weight.value !== undefined) {
      return `${weight.value} ${weight.unit || 'kg'}`
    }
    return 'N/A'
  }

  const formatHeight = (height: any) => {
    if (typeof height === 'number') {
      return `${height} m`
    }
    if (height && typeof height === 'object' && height.value !== undefined) {
      return `${height.value} ${height.unit || 'm'}`
    }
    return 'N/A'
  }

  const formatVitalSign = (value: any, unit: string = '') => {
    if (value === null || value === undefined) {
      return 'N/A'
    }
    if (typeof value === 'object') {
      return 'N/A' // Handle complex objects gracefully
    }
    return `${value}${unit}`
  }

  // Helper function to safely render arrays
  const safeArray = (arr: any) => {
    return Array.isArray(arr) ? arr : []
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Patient not found</h3>
          <p className="text-muted-foreground mb-4">
            The patient you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              Patient ID: {patient._id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={patient.isActive ? "default" : "secondary"}>
            {patient.isActive ? "Active" : "Inactive"}
          </Badge>
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </div>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Full Name</h4>
              <p className="text-lg">
                {patient.firstName} {patient.middleName && `${patient.middleName} `}{patient.lastName}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Date of Birth</h4>
              <p className="text-lg">{formatDate(patient.dateOfBirth)}</p>
              <p className="text-sm text-muted-foreground">{calculateAge(patient.dateOfBirth)} years old</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Gender</h4>
              <p className="text-lg capitalize">{patient.gender}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Blood Type</h4>
              <p className="text-lg">{patient.bloodType}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Marital Status</h4>
              <p className="text-lg capitalize">{patient.maritalStatus}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Nationality</h4>
              <p className="text-lg">{patient.nationality}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Language</h4>
              <p className="text-lg">{patient.languageSpoken}</p>
            </div>
            {patient.religion && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Religion</h4>
                <p className="text-lg">{patient.religion}</p>
              </div>
            )}
            {patient.occupation && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Occupation</h4>
                <p className="text-lg">{patient.occupation}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Primary Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{patient.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{patient.emailAddress}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 mt-1 text-muted-foreground" />
                  <span>{patient.homeAddress}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Emergency Contact</h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{patient.emergencyContact.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({patient.emergencyContact.relationship})
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{patient.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insurance & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Insurance & Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Insurance Provider</h4>
              <p className="text-lg">{patient.insurance.provider}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Policy Number</h4>
              <p className="text-lg">{patient.insurance.policyNumber}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Payment Type</h4>
              <p className="text-lg capitalize">{patient.insurance.paymentType}</p>
            </div>
            {patient.insurance.billingAddress && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Billing Address</h4>
                <p className="text-lg">{patient.insurance.billingAddress}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Chronic Illnesses</h4>
              {safeArray(patient.medicalHistory?.chronicIllnesses).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {safeArray(patient.medicalHistory.chronicIllnesses).map((illness, index) => (
                    <li key={index} className="text-sm">{illness}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None reported</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Allergies</h4>
              {safeArray(patient.medicalHistory?.allergies).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {safeArray(patient.medicalHistory.allergies).map((allergy, index) => (
                    <li key={index} className="text-sm text-red-600">{allergy}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None reported</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Past Surgeries</h4>
              {safeArray(patient.medicalHistory?.pastSurgeries).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {safeArray(patient.medicalHistory.pastSurgeries).map((surgery, index) => (
                    <li key={index} className="text-sm">{surgery}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None reported</p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Current Medications</h4>
              {safeArray(patient.medicalHistory?.currentMedications).length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {safeArray(patient.medicalHistory.currentMedications).map((medication, index) => (
                    <li key={index} className="text-sm">{medication}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None reported</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Smoking Status</h4>
              <p className="text-lg capitalize">{patient.medicalHistory.smokingStatus}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Alcohol Consumption</h4>
              <p className="text-lg capitalize">{patient.medicalHistory.alcoholConsumption}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Family History</h4>
              <p className="text-lg">{patient.medicalHistory.familyHistory || 'Not provided'}</p>
            </div>
          </div>

          {patient.medicalHistory.vaccinationHistory && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Vaccination History</h4>
              <p className="text-sm">{patient.medicalHistory.vaccinationHistory}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admission & Current Visit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="w-5 h-5 mr-2" />
            Current Admission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Admission Date</h4>
              <p className="text-lg">{formatDate(patient.admission.dateOfAdmission)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Doctor Assigned</h4>
              <p className="text-lg">{patient.admission.doctorAssigned}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Department</h4>
              <p className="text-lg capitalize">{patient.admission.department}</p>
            </div>
            {patient.admission.followUpDate && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Follow-up Date</h4>
                <p className="text-lg">{formatDate(patient.admission.followUpDate)}</p>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Symptoms/Complaints</h4>
              <p className="text-sm">{patient.admission.symptomsComplaints}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Provisional Diagnosis</h4>
              <p className="text-sm">{patient.admission.provisionalDiagnosis}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Treatment Plan</h4>
              <p className="text-sm">{patient.admission.treatmentPlan}</p>
            </div>

            {safeArray(patient.admission?.labTestsOrdered).length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Lab Tests Ordered</h4>
                <ul className="list-disc list-inside space-y-1">
                  {safeArray(patient.admission.labTestsOrdered).map((test, index) => (
                    <li key={index} className="text-sm">{test}</li>
                  ))}
                </ul>
              </div>
            )}

            {safeArray(patient.admission?.proceduresPerformed).length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Procedures Performed</h4>
                <ul className="list-disc list-inside space-y-1">
                  {safeArray(patient.admission.proceduresPerformed).map((procedure, index) => (
                    <li key={index} className="text-sm">{procedure}</li>
                  ))}
                </ul>
              </div>
            )}

            {patient.admission.medicationsPrescribed && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Medications Prescribed</h4>
                <p className="text-sm">{patient.admission.medicationsPrescribed}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Latest Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground">Temperature</h4>
              <p className="text-2xl font-bold">{formatVitalSign(patient.vitalSigns.temperature, '°C')}</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground">Blood Pressure</h4>
              <p className="text-2xl font-bold">{formatVitalSign(patient.vitalSigns.bloodPressure)}</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground">Heart Rate</h4>
              <p className="text-2xl font-bold">{formatVitalSign(patient.vitalSigns.heartRate, ' bpm')}</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground">Oxygen Sat</h4>
              <p className="text-2xl font-bold">{formatVitalSign(patient.vitalSigns.oxygenSaturation, '%')}</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground">Weight</h4>
              <p className="text-2xl font-bold">{formatWeight(patient.vitalSigns.weight)}</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground">Height</h4>
              <p className="text-2xl font-bold">{formatHeight(patient.vitalSigns.height)}</p>
            </div>
            <div className="text-center">
              <h4 className="font-medium text-sm text-muted-foreground">Respiratory Rate</h4>
              <p className="text-2xl font-bold">{formatVitalSign(patient.vitalSigns.respiratoryRate, '/min')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {safeArray(patient.testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeArray(patient.testResults).map((test, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{test.testName}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(test.testDate)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{test.result}</p>
                  {test.doctorComments && (
                    <p className="text-sm text-muted-foreground italic">
                      Doctor's Comments: {test.doctorComments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-muted-foreground">Patient ID</h4>
              <p className="font-mono">{patient._id}</p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground">User ID</h4>
              <p className="font-mono">{patient.userId}</p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground">Created</h4>
              <p>{formatDateTime(patient.createdAt)}</p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground">Last Updated</h4>
              <p>{formatDateTime(patient.updatedAt)}</p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground">Created By</h4>
              <p>{patient.createdBy}</p>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground">Status</h4>
              <Badge variant={patient.isActive ? "default" : "secondary"}>
                {patient.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
