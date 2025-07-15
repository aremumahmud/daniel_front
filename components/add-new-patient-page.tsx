"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, AlertCircle, Save } from "lucide-react"
import { usePersistentForm } from "@/hooks/use-persistent-form"
import { adminService, type CreatePatientData } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"

const sections = [
  "Patient Demographics",
  "Contact Information",
]

const initialFormData: CreatePatientData = {
  // Demographics
  firstName: "",
  lastName: "",
  middleName: "",
  matricNumber: "",
  dateOfBirth: "",
  gender: "male",
  maritalStatus: "single",
  nationality: "",
  languageSpoken: "",
  bloodType: "O+",
  religion: "",
  occupation: "",

  // Contact
  phoneNumber: "",
  emailAddress: "",
  homeAddress: "",
  emergencyContact: {
    name: "",
    phone: "",
    relationship: "spouse"
  },

  // Optional sections (kept for compatibility but with default values)
  insurance: {
    provider: "",
    policyNumber: "",
    paymentType: "cash",
    billingAddress: ""
  },
  medicalHistory: {
    chronicIllnesses: [],
    allergies: [],
    pastSurgeries: [],
    currentMedications: [],
    familyHistory: "",
    smokingStatus: "never",
    alcoholConsumption: "none",
    vaccinationHistory: ""
  },
  admission: {
    dateOfAdmission: "",
    doctorAssigned: "",
    department: "general",
    symptomsComplaints: "",
    provisionalDiagnosis: "",
    labTestsOrdered: [],
    medicationsPrescribed: "",
    proceduresPerformed: [],
    treatmentPlan: "",
    followUpDate: ""
  },
  vitalSigns: {
    temperature: 36.5,
    bloodPressure: "",
    heartRate: 72,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 70,
    height: 1.7
  },
  testResults: [],
  dischargeSummary: {
    dischargeDate: "",
    finalDiagnosis: "",
    medicationsForHome: "",
    dischargeInstructions: "",
    nextFollowUp: ""
  },
  documents: {
    scannedIdCard: "",
    labTestReports: [],
    imagingReports: []
  }
}

export default function AddNewPatientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()

  const {
    formData,
    currentSection,
    isLoaded,
    updateFormData,
    updateField,
    updateNestedField,
    clearFormData,
    nextSection,
    previousSection,
    getProgress,
    isFirstSection,
    isLastSection
  } = usePersistentForm({
    key: "add-patient-form",
    initialData: initialFormData,
    sections
  })

  const validateCurrentSection = (): boolean => {
    const errors: string[] = []

    switch (currentSection) {
      case 0: // Demographics
        if (!formData.firstName.trim()) errors.push("First name is required")
        if (!formData.lastName.trim()) errors.push("Last name is required")
        if (!formData.matricNumber.trim()) errors.push("Matric number is required")
        if (!formData.dateOfBirth) errors.push("Date of birth is required")
        if (!formData.nationality.trim()) errors.push("Nationality is required")
        if (!formData.languageSpoken.trim()) errors.push("Language spoken is required")
        break
      case 1: // Contact
        if (!formData.phoneNumber.trim()) errors.push("Phone number is required")
        if (!formData.emailAddress.trim()) errors.push("Email address is required")
        if (!formData.homeAddress.trim()) errors.push("Home address is required")
        if (!formData.emergencyContact.name.trim()) errors.push("Emergency contact name is required")
        if (!formData.emergencyContact.phone.trim()) errors.push("Emergency contact phone is required")
        break
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleNext = async () => {
    if (!isLastSection) {
      if (validateCurrentSection()) {
        nextSection()
      }
    } else {
      await handleSubmit()
    }
  }

  const handlePrevious = () => {
    previousSection()
  }

  const handleSubmit = async () => {
    if (!validateCurrentSection()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Create patient with simplified data structure
      const result = await adminService.createPatient(formData)

      toast({
        title: "Success",
        description: "Patient created successfully",
      })

      // Clear form data after successful submission
      clearFormData()
      setShowSuccessModal(true)

    } catch (error) {
      console.error("Failed to create patient:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create patient"
      setSubmitError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    router.push("/dashboard/patients")
  }

  const handleSaveProgress = () => {
    toast({
      title: "Progress Saved",
      description: "Your form data has been saved automatically",
    })
  }

  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-8"></div>
          <div className="h-4 bg-muted rounded w-full mb-4"></div>
          <div className="h-2 bg-muted rounded w-full mb-8"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Patient</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveProgress}>
            <Save className="h-4 w-4 mr-2" />
            Auto-saved
          </Button>
          <Button variant="outline" size="sm" onClick={clearFormData}>
            Clear Form
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`text-sm cursor-pointer hover:text-primary transition-colors ${
                index <= currentSection ? "text-primary font-medium" : "text-muted-foreground"
              }`}
              onClick={() => {
                if (index < currentSection || (index === currentSection + 1 && validateCurrentSection())) {
                  // Allow navigation to previous sections or next section if current is valid
                }
              }}
            >
              {index + 1}. {section}
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
          />
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Step {currentSection + 1} of {sections.length} - {sections[currentSection]}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{sections[currentSection]}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
              layout
            >
              {currentSection === 0 && <PatientDemographics formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
              {currentSection === 1 && <ContactInformation formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handlePrevious} disabled={isFirstSection || isSubmitting}>
            Previous
          </Button>
          <div className="flex gap-2">
            {submitError && (
              <div className="flex items-center text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mr-1" />
                {submitError}
              </div>
            )}
            <Button onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : isLastSection ? "Submit Patient" : "Next"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Patient Added Successfully</DialogTitle>
            <DialogDescription>The new patient has been added to the system.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <Button onClick={handleCloseSuccessModal}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function PatientDemographics({ formData, updateField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="middleName">Middle Name (Optional)</Label>
        <Input
          id="middleName"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={(e) => updateField('middleName', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="matricNumber">Matric Number *</Label>
        <Input
          id="matricNumber"
          placeholder="e.g., 2023/CS/001"
          value={formData.matricNumber}
          onChange={(e) => updateField('matricNumber', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateField('dateOfBirth', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="gender">Gender *</Label>
        <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="maritalStatus">Marital Status *</Label>
        <Select value={formData.maritalStatus} onValueChange={(value) => updateField('maritalStatus', value)}>
          <SelectTrigger id="maritalStatus">
            <SelectValue placeholder="Select marital status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
            <SelectItem value="divorced">Divorced</SelectItem>
            <SelectItem value="widowed">Widowed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="nationality">Nationality *</Label>
        <Input
          id="nationality"
          placeholder="Nationality"
          value={formData.nationality}
          onChange={(e) => updateField('nationality', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="languageSpoken">Language Spoken *</Label>
        <Input
          id="languageSpoken"
          placeholder="Language Spoken"
          value={formData.languageSpoken}
          onChange={(e) => updateField('languageSpoken', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="bloodType">Blood Type *</Label>
        <Select value={formData.bloodType} onValueChange={(value) => updateField('bloodType', value)}>
          <SelectTrigger id="bloodType">
            <SelectValue placeholder="Select blood type" />
          </SelectTrigger>
          <SelectContent>
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
        <Label htmlFor="religion">Religion (Optional)</Label>
        <Input
          id="religion"
          placeholder="Religion"
          value={formData.religion || ''}
          onChange={(e) => updateField('religion', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="occupation">Occupation (Optional)</Label>
        <Input
          id="occupation"
          placeholder="Occupation"
          value={formData.occupation || ''}
          onChange={(e) => updateField('occupation', e.target.value)}
        />
      </div>
    </div>
  )
}

export function ContactInformation({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="phoneNumber">Phone Number *</Label>
        <Input
          id="phoneNumber"
          placeholder="+2348012345678"
          value={formData.phoneNumber}
          onChange={(e) => updateField('phoneNumber', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="emailAddress">Email Address *</Label>
        <Input
          id="emailAddress"
          type="email"
          placeholder="email@example.com"
          value={formData.emailAddress}
          onChange={(e) => updateField('emailAddress', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="homeAddress">Home Address *</Label>
        <Textarea
          id="homeAddress"
          placeholder="Enter home address"
          value={formData.homeAddress}
          onChange={(e) => updateField('homeAddress', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
        <Input
          id="emergencyContactName"
          placeholder="Emergency Contact Name"
          value={formData.emergencyContact.name}
          onChange={(e) => updateNestedField('emergencyContact.name', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
        <Input
          id="emergencyContactPhone"
          placeholder="+2348012345678"
          value={formData.emergencyContact.phone}
          onChange={(e) => updateNestedField('emergencyContact.phone', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="relationshipToEmergencyContact">Relationship to Emergency Contact *</Label>
        <Select
          value={formData.emergencyContact.relationship}
          onValueChange={(value) => updateNestedField('emergencyContact.relationship', value)}
        >
          <SelectTrigger id="relationshipToEmergencyContact">
            <SelectValue placeholder="Select relationship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spouse">Spouse</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="sibling">Sibling</SelectItem>
            <SelectItem value="friend">Friend</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}






