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
  "Insurance & Billing",
  "Medical History",
  "Admission & Visits",
  "Vital Signs",
  "Test Results & Reports",
  "Discharge Summary",
  "Digital Documents & Attachments",
]

const initialFormData: CreatePatientData = {
  // Demographics
  firstName: "",
  lastName: "",
  middleName: "",
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

  // Insurance
  insurance: {
    provider: "",
    policyNumber: "",
    paymentType: "insurance",
    billingAddress: ""
  },

  // Medical History
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

  // Admission
  admission: {
    dateOfAdmission: "",
    doctorAssigned: "",
    department: "cardiology",
    symptomsComplaints: "",
    provisionalDiagnosis: "",
    labTestsOrdered: [],
    medicationsPrescribed: "",
    proceduresPerformed: [],
    treatmentPlan: "",
    followUpDate: ""
  },

  // Vital Signs
  vitalSigns: {
    temperature: 36.5,
    bloodPressure: "",
    heartRate: 72,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 70,
    height: 1.7
  },

  // Optional sections
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
      case 2: // Insurance
        if (!formData.insurance.provider.trim()) errors.push("Insurance provider is required")
        if (!formData.insurance.policyNumber.trim()) errors.push("Policy number is required")
        break
      case 4: // Admission
        if (!formData.admission.dateOfAdmission) errors.push("Date of admission is required")
        if (!formData.admission.doctorAssigned.trim()) errors.push("Doctor assigned is required")
        if (!formData.admission.symptomsComplaints.trim()) errors.push("Symptoms/complaints are required")
        if (!formData.admission.provisionalDiagnosis.trim()) errors.push("Provisional diagnosis is required")
        if (!formData.admission.treatmentPlan.trim()) errors.push("Treatment plan is required")
        break
      case 5: // Vital Signs
        if (!formData.vitalSigns.bloodPressure.trim()) errors.push("Blood pressure is required")
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
      // Process arrays from comma-separated strings
      const processedData: CreatePatientData = {
        ...formData,
        medicalHistory: {
          ...formData.medicalHistory,
          chronicIllnesses: formData.medicalHistory.chronicIllnesses.length > 0
            ? formData.medicalHistory.chronicIllnesses
            : [],
          allergies: formData.medicalHistory.allergies.length > 0
            ? formData.medicalHistory.allergies
            : [],
          pastSurgeries: formData.medicalHistory.pastSurgeries.length > 0
            ? formData.medicalHistory.pastSurgeries
            : [],
          currentMedications: formData.medicalHistory.currentMedications.length > 0
            ? formData.medicalHistory.currentMedications
            : []
        },
        admission: {
          ...formData.admission,
          labTestsOrdered: formData.admission.labTestsOrdered.length > 0
            ? formData.admission.labTestsOrdered
            : [],
          proceduresPerformed: formData.admission.proceduresPerformed.length > 0
            ? formData.admission.proceduresPerformed
            : []
        }
      }

      const result = await adminService.createPatient(processedData)

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
              {currentSection === 2 && <InsuranceAndBilling formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
              {currentSection === 3 && <MedicalHistory formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
              {currentSection === 4 && <AdmissionAndVisits formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
              {currentSection === 5 && <VitalSigns formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
              {currentSection === 6 && <TestResultsAndReports formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
              {currentSection === 7 && <DischargeSummary formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
              {currentSection === 8 && <DigitalDocumentsAndAttachments formData={formData} updateField={updateField} updateNestedField={updateNestedField} />}
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

export function InsuranceAndBilling({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
        <Input
          id="insuranceProvider"
          placeholder="Insurance Provider"
          value={formData.insurance.provider}
          onChange={(e) => updateNestedField('insurance.provider', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="insurancePolicyNumber">Insurance Policy Number *</Label>
        <Input
          id="insurancePolicyNumber"
          placeholder="Policy Number"
          value={formData.insurance.policyNumber}
          onChange={(e) => updateNestedField('insurance.policyNumber', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="paymentType">Payment Type *</Label>
        <Select
          value={formData.insurance.paymentType}
          onValueChange={(value) => updateNestedField('insurance.paymentType', value)}
        >
          <SelectTrigger id="paymentType">
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="creditCard">Credit Card</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="billingAddress">Billing Address (Optional)</Label>
        <Textarea
          id="billingAddress"
          placeholder="Enter billing address"
          value={formData.insurance.billingAddress || ''}
          onChange={(e) => updateNestedField('insurance.billingAddress', e.target.value)}
        />
      </div>
    </div>
  )
}

export function MedicalHistory({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="chronicIllnesses">Chronic Illnesses (Optional)</Label>
        <Textarea
          id="chronicIllnesses"
          placeholder="Enter chronic illnesses, separated by commas"
          value={formData.medicalHistory.chronicIllnesses.join(', ')}
          onChange={(e) => updateNestedField('medicalHistory.chronicIllnesses', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
      <div>
        <Label htmlFor="allergies">Allergies (Optional)</Label>
        <Textarea
          id="allergies"
          placeholder="Enter allergies, separated by commas"
          value={formData.medicalHistory.allergies.join(', ')}
          onChange={(e) => updateNestedField('medicalHistory.allergies', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
      <div>
        <Label htmlFor="pastSurgeries">Past Surgeries (Optional)</Label>
        <Textarea
          id="pastSurgeries"
          placeholder="Enter past surgeries, separated by commas"
          value={formData.medicalHistory.pastSurgeries.join(', ')}
          onChange={(e) => updateNestedField('medicalHistory.pastSurgeries', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
      <div>
        <Label htmlFor="currentMedications">Current Medications (Optional)</Label>
        <Textarea
          id="currentMedications"
          placeholder="Enter current medications, separated by commas"
          value={formData.medicalHistory.currentMedications.join(', ')}
          onChange={(e) => updateNestedField('medicalHistory.currentMedications', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
      <div>
        <Label htmlFor="familyHistory">Family History (Optional)</Label>
        <Textarea
          id="familyHistory"
          placeholder="Enter family history (e.g., Father: Diabetes, Mother: Hypertension)"
          value={formData.medicalHistory.familyHistory}
          onChange={(e) => updateNestedField('medicalHistory.familyHistory', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="smokingStatus">Smoking Status</Label>
        <Select
          value={formData.medicalHistory.smokingStatus}
          onValueChange={(value) => updateNestedField('medicalHistory.smokingStatus', value)}
        >
          <SelectTrigger id="smokingStatus">
            <SelectValue placeholder="Select smoking status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="formerSmoker">Former Smoker</SelectItem>
            <SelectItem value="currentSmoker">Current Smoker</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="alcoholConsumption">Alcohol Consumption</Label>
        <Select
          value={formData.medicalHistory.alcoholConsumption}
          onValueChange={(value) => updateNestedField('medicalHistory.alcoholConsumption', value)}
        >
          <SelectTrigger id="alcoholConsumption">
            <SelectValue placeholder="Select alcohol consumption" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="occasional">Occasional</SelectItem>
            <SelectItem value="frequent">Frequent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="vaccinationHistory">Vaccination History (Optional)</Label>
        <Textarea
          id="vaccinationHistory"
          placeholder="Enter vaccination history (e.g., Hepatitis B: 2020-02-10)"
          value={formData.medicalHistory.vaccinationHistory}
          onChange={(e) => updateNestedField('medicalHistory.vaccinationHistory', e.target.value)}
        />
      </div>
    </div>
  )
}

export function AdmissionAndVisits({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dateOfAdmission">Date of Admission *</Label>
        <Input
          id="dateOfAdmission"
          type="date"
          value={formData.admission.dateOfAdmission}
          onChange={(e) => updateNestedField('admission.dateOfAdmission', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="doctorAssigned">Doctor Assigned *</Label>
        <Input
          id="doctorAssigned"
          placeholder="Doctor's full name"
          value={formData.admission.doctorAssigned}
          onChange={(e) => updateNestedField('admission.doctorAssigned', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="department">Department *</Label>
        <Select
          value={formData.admission.department}
          onValueChange={(value) => updateNestedField('admission.department', value)}
        >
          <SelectTrigger id="department">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cardiology">Cardiology</SelectItem>
            <SelectItem value="neurology">Neurology</SelectItem>
            <SelectItem value="pediatrics">Pediatrics</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="symptomsComplaints">Symptoms/Complaints *</Label>
        <Textarea
          id="symptomsComplaints"
          placeholder="Enter symptoms or complaints"
          value={formData.admission.symptomsComplaints}
          onChange={(e) => updateNestedField('admission.symptomsComplaints', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="provisionalDiagnosis">Provisional Diagnosis *</Label>
        <Input
          id="provisionalDiagnosis"
          placeholder="Enter provisional diagnosis"
          value={formData.admission.provisionalDiagnosis}
          onChange={(e) => updateNestedField('admission.provisionalDiagnosis', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="labTestsOrdered">Lab Tests Ordered (Optional)</Label>
        <Textarea
          id="labTestsOrdered"
          placeholder="Enter lab tests ordered, separated by commas"
          value={formData.admission.labTestsOrdered.join(', ')}
          onChange={(e) => updateNestedField('admission.labTestsOrdered', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
      <div>
        <Label htmlFor="medicationsPrescribed">Medications Prescribed (Optional)</Label>
        <Textarea
          id="medicationsPrescribed"
          placeholder="Enter medications prescribed (e.g., Paracetamol, 500mg, 3x daily, 5 days)"
          value={formData.admission.medicationsPrescribed}
          onChange={(e) => updateNestedField('admission.medicationsPrescribed', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="proceduresPerformed">Procedures Performed (Optional)</Label>
        <Textarea
          id="proceduresPerformed"
          placeholder="Enter procedures performed, separated by commas"
          value={formData.admission.proceduresPerformed.join(', ')}
          onChange={(e) => updateNestedField('admission.proceduresPerformed', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
      <div>
        <Label htmlFor="treatmentPlan">Treatment Plan *</Label>
        <Textarea
          id="treatmentPlan"
          placeholder="Enter treatment plan"
          value={formData.admission.treatmentPlan}
          onChange={(e) => updateNestedField('admission.treatmentPlan', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
        <Input
          id="followUpDate"
          type="date"
          value={formData.admission.followUpDate}
          onChange={(e) => updateNestedField('admission.followUpDate', e.target.value)}
        />
      </div>
    </div>
  )
}

export function VitalSigns({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="temperature">Temperature (°C)</Label>
        <Input
          id="temperature"
          type="number"
          step="0.1"
          placeholder="37.5"
          value={formData.vitalSigns.temperature}
          onChange={(e) => updateNestedField('vitalSigns.temperature', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="bloodPressure">Blood Pressure (mmHg) *</Label>
        <Input
          id="bloodPressure"
          placeholder="120/80"
          value={formData.vitalSigns.bloodPressure}
          onChange={(e) => updateNestedField('vitalSigns.bloodPressure', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
        <Input
          id="heartRate"
          type="number"
          placeholder="75"
          value={formData.vitalSigns.heartRate}
          onChange={(e) => updateNestedField('vitalSigns.heartRate', parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
        <Input
          id="respiratoryRate"
          type="number"
          placeholder="16"
          value={formData.vitalSigns.respiratoryRate}
          onChange={(e) => updateNestedField('vitalSigns.respiratoryRate', parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
        <Input
          id="oxygenSaturation"
          type="number"
          placeholder="98"
          value={formData.vitalSigns.oxygenSaturation}
          onChange={(e) => updateNestedField('vitalSigns.oxygenSaturation', parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          placeholder="75.4"
          value={formData.vitalSigns.weight}
          onChange={(e) => updateNestedField('vitalSigns.weight', parseFloat(e.target.value) || 0)}
        />
      </div>
      <div>
        <Label htmlFor="height">Height (m)</Label>
        <Input
          id="height"
          type="number"
          step="0.01"
          placeholder="1.75"
          value={formData.vitalSigns.height}
          onChange={(e) => updateNestedField('vitalSigns.height', parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  )
}

export function TestResultsAndReports({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  // Note: testResults is an array, but for simplicity we'll handle the first test result
  // In a real application, you might want to implement dynamic adding/removing of test results
  const testResult = formData.testResults[0] || { testName: '', testDate: '', result: '', doctorComments: '' }

  const updateTestResult = (field: string, value: any) => {
    const updatedResults = [...formData.testResults]
    if (updatedResults.length === 0) {
      updatedResults.push({ testName: '', testDate: '', result: '', doctorComments: '' })
    }
    updatedResults[0] = { ...updatedResults[0], [field]: value }
    updateField('testResults', updatedResults)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Note: This section handles the first test result. Additional test results can be added later.
      </div>
      <div>
        <Label htmlFor="testName">Test Name (Optional)</Label>
        <Input
          id="testName"
          placeholder="e.g., Blood Sugar Test"
          value={testResult.testName}
          onChange={(e) => updateTestResult('testName', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="testDate">Test Date (Optional)</Label>
        <Input
          id="testDate"
          type="date"
          value={testResult.testDate}
          onChange={(e) => updateTestResult('testDate', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="testResult">Test Result (Optional)</Label>
        <Textarea
          id="testResult"
          placeholder="Enter test result (e.g., Fasting: 90 mg/dL, Postprandial: 140 mg/dL)"
          value={testResult.result}
          onChange={(e) => updateTestResult('result', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="doctorComments">Doctor's Comments (Optional)</Label>
        <Textarea
          id="doctorComments"
          placeholder="Enter doctor's comments on the test results"
          value={testResult.doctorComments}
          onChange={(e) => updateTestResult('doctorComments', e.target.value)}
        />
      </div>
    </div>
  )
}

export function DischargeSummary({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dischargeDate">Discharge Date (Optional)</Label>
        <Input
          id="dischargeDate"
          type="date"
          value={formData.dischargeSummary.dischargeDate}
          onChange={(e) => updateNestedField('dischargeSummary.dischargeDate', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="finalDiagnosis">Final Diagnosis (Optional)</Label>
        <Input
          id="finalDiagnosis"
          placeholder="Enter final diagnosis"
          value={formData.dischargeSummary.finalDiagnosis}
          onChange={(e) => updateNestedField('dischargeSummary.finalDiagnosis', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="medicationsForHome">Medications for Home (Optional)</Label>
        <Textarea
          id="medicationsForHome"
          placeholder="Enter medications for home (e.g., Ibuprofen, 400mg, 5 days)"
          value={formData.dischargeSummary.medicationsForHome}
          onChange={(e) => updateNestedField('dischargeSummary.medicationsForHome', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="dischargeInstructions">Discharge Instructions (Optional)</Label>
        <Textarea
          id="dischargeInstructions"
          placeholder="Enter discharge instructions"
          value={formData.dischargeSummary.dischargeInstructions}
          onChange={(e) => updateNestedField('dischargeSummary.dischargeInstructions', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="nextFollowUp">Next Follow-Up (Optional)</Label>
        <Input
          id="nextFollowUp"
          type="date"
          value={formData.dischargeSummary.nextFollowUp}
          onChange={(e) => updateNestedField('dischargeSummary.nextFollowUp', e.target.value)}
        />
      </div>
    </div>
  )
}

export function DigitalDocumentsAndAttachments({ formData, updateField, updateNestedField }: {
  formData: CreatePatientData,
  updateField: (field: keyof CreatePatientData, value: any) => void,
  updateNestedField: (path: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Note: File uploads will be handled by the backend. For now, you can specify file names or paths.
      </div>
      <div>
        <Label htmlFor="scannedIdCard">Scanned ID Card (Optional)</Label>
        <Input
          id="scannedIdCard"
          placeholder="Enter file name or path for scanned ID card"
          value={formData.documents.scannedIdCard}
          onChange={(e) => updateNestedField('documents.scannedIdCard', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="labTestReports">Lab Test Reports (Optional)</Label>
        <Input
          id="labTestReports"
          placeholder="Enter file names for lab test reports, separated by commas"
          value={formData.documents.labTestReports.join(', ')}
          onChange={(e) => updateNestedField('documents.labTestReports', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
      <div>
        <Label htmlFor="imagingReports">Imaging Reports (Optional)</Label>
        <Input
          id="imagingReports"
          placeholder="Enter file names for imaging reports, separated by commas"
          value={formData.documents.imagingReports.join(', ')}
          onChange={(e) => updateNestedField('documents.imagingReports', e.target.value.split(',').map(item => item.trim()).filter(item => item))}
        />
      </div>
    </div>
  )
}
