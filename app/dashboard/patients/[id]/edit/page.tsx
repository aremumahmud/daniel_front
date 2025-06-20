"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { adminService, type PatientDetails, type CreatePatientData } from "@/services/admin.service"
import { ArrowLeft, Save } from "lucide-react"

// We'll reuse the form components from add-new-patient-page
import { 
  PatientDemographics,
  ContactInformation,
  InsuranceAndBilling,
  MedicalHistory,
  AdmissionAndVisits,
  VitalSigns,
  TestResultsAndReports,
  DischargeSummary,
  DigitalDocumentsAndAttachments
} from "@/components/add-new-patient-page"

interface EditPatientPageProps {
  params: {
    id: string
  }
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const router = useRouter()
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [formData, setFormData] = useState<CreatePatientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true)
        const patientData = await adminService.getPatientById(params.id)
        setPatient(patientData)
        
        // Convert patient data to form data format
        const formDataFromPatient: CreatePatientData = {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          middleName: patientData.middleName || "",
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          maritalStatus: patientData.maritalStatus,
          nationality: patientData.nationality,
          languageSpoken: patientData.languageSpoken,
          bloodType: patientData.bloodType,
          religion: patientData.religion || "",
          occupation: patientData.occupation || "",
          phoneNumber: patientData.phoneNumber,
          emailAddress: patientData.emailAddress,
          homeAddress: patientData.homeAddress,
          emergencyContact: patientData.emergencyContact,
          insurance: patientData.insurance,
          medicalHistory: patientData.medicalHistory,
          admission: patientData.admission,
          vitalSigns: patientData.vitalSigns,
          testResults: patientData.testResults,
          dischargeSummary: patientData.dischargeSummary,
          documents: patientData.documents
        }
        
        setFormData(formDataFromPatient)
      } catch (error) {
        console.error("Failed to fetch patient:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [params.id])

  const updateField = (field: keyof CreatePatientData, value: any) => {
    if (!formData) return
    setFormData(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateNestedField = (path: string, value: any) => {
    if (!formData) return
    setFormData(prev => {
      if (!prev) return null
      const keys = path.split('.')
      const newData = { ...prev }
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const handleSave = async () => {
    if (!formData) return

    try {
      setSaving(true)
      await adminService.updatePatient(params.id, formData)
      
      toast({
        title: "Success",
        description: "Patient updated successfully",
      })
      
      router.push(`/dashboard/patients/${params.id}`)
    } catch (error) {
      console.error("Failed to update patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/patients/${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
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

  if (!patient || !formData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Patient not found</h3>
            <p className="text-muted-foreground mb-4">
              The patient you're trying to edit doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/dashboard/patients')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Patient: {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              Update patient information and medical records
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>Basic patient information and demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientDemographics 
              formData={formData} 
              updateField={updateField} 
              updateNestedField={updateNestedField} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Patient and emergency contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactInformation 
              formData={formData} 
              updateField={updateField} 
              updateNestedField={updateNestedField} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insurance & Billing</CardTitle>
            <CardDescription>Insurance and payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <InsuranceAndBilling 
              formData={formData} 
              updateField={updateField} 
              updateNestedField={updateNestedField} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>Patient medical background and history</CardDescription>
          </CardHeader>
          <CardContent>
            <MedicalHistory 
              formData={formData} 
              updateField={updateField} 
              updateNestedField={updateNestedField} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Admission</CardTitle>
            <CardDescription>Current visit and admission details</CardDescription>
          </CardHeader>
          <CardContent>
            <AdmissionAndVisits 
              formData={formData} 
              updateField={updateField} 
              updateNestedField={updateNestedField} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
            <CardDescription>Latest vital signs and measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <VitalSigns 
              formData={formData} 
              updateField={updateField} 
              updateNestedField={updateNestedField} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
