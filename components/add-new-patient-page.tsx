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
import { CheckCircle } from "lucide-react"

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

export default function AddNewPatientPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()

  const handleNext = async () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setIsSubmitting(true)
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsSubmitting(false)
      setShowSuccessModal(true)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    router.push("/dashboard/patients")
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Add New Patient</h1>
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`text-sm ${index <= currentSection ? "text-primary" : "text-muted-foreground"}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
            transition={{ duration: 0.5, type: "spring", stiffness: 60 }}
          />
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
              {currentSection === 0 && <PatientDemographics />}
              {currentSection === 1 && <ContactInformation />}
              {currentSection === 2 && <InsuranceAndBilling />}
              {currentSection === 3 && <MedicalHistory />}
              {currentSection === 4 && <AdmissionAndVisits />}
              {currentSection === 5 && <VitalSigns />}
              {currentSection === 6 && <TestResultsAndReports />}
              {currentSection === 7 && <DischargeSummary />}
              {currentSection === 8 && <DigitalDocumentsAndAttachments />}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handlePrevious} disabled={currentSection === 0}>
            Previous
          </Button>
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : currentSection === sections.length - 1 ? "Submit" : "Next"}
          </Button>
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

function PatientDemographics() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="First Name" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Last Name" />
        </div>
      </div>
      <div>
        <Label htmlFor="middleName">Middle Name (Optional)</Label>
        <Input id="middleName" placeholder="Middle Name" />
      </div>
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input id="dateOfBirth" type="date" />
      </div>
      <div>
        <Label htmlFor="gender">Gender</Label>
        <Select>
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
        <Label htmlFor="maritalStatus">Marital Status</Label>
        <Select>
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
        <Label htmlFor="nationality">Nationality</Label>
        <Input id="nationality" placeholder="Nationality" />
      </div>
      <div>
        <Label htmlFor="languageSpoken">Language Spoken</Label>
        <Input id="languageSpoken" placeholder="Language Spoken" />
      </div>
      <div>
        <Label htmlFor="bloodType">Blood Type</Label>
        <Select>
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
        <Input id="religion" placeholder="Religion" />
      </div>
      <div>
        <Label htmlFor="occupation">Occupation (Optional)</Label>
        <Input id="occupation" placeholder="Occupation" />
      </div>
    </div>
  )
}

function ContactInformation() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input id="phoneNumber" placeholder="+2348012345678" />
      </div>
      <div>
        <Label htmlFor="emailAddress">Email Address</Label>
        <Input id="emailAddress" type="email" placeholder="email@example.com" />
      </div>
      <div>
        <Label htmlFor="homeAddress">Home Address</Label>
        <Textarea id="homeAddress" placeholder="Enter home address" />
      </div>
      <div>
        <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
        <Input id="emergencyContactName" placeholder="Emergency Contact Name" />
      </div>
      <div>
        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
        <Input id="emergencyContactPhone" placeholder="+2348012345678" />
      </div>
      <div>
        <Label htmlFor="relationshipToEmergencyContact">Relationship to Emergency Contact</Label>
        <Select>
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

function InsuranceAndBilling() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
        <Input id="insuranceProvider" placeholder="Insurance Provider" />
      </div>
      <div>
        <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
        <Input id="insurancePolicyNumber" placeholder="Policy Number" />
      </div>
      <div>
        <Label htmlFor="paymentType">Payment Type</Label>
        <Select>
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
        <Textarea id="billingAddress" placeholder="Enter billing address" />
      </div>
    </div>
  )
}

function MedicalHistory() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="chronicIllnesses">Chronic Illnesses</Label>
        <Textarea id="chronicIllnesses" placeholder="Enter chronic illnesses, separated by commas" />
      </div>
      <div>
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea id="allergies" placeholder="Enter allergies, separated by commas" />
      </div>
      <div>
        <Label htmlFor="pastSurgeries">Past Surgeries</Label>
        <Textarea id="pastSurgeries" placeholder="Enter past surgeries, separated by commas" />
      </div>
      <div>
        <Label htmlFor="currentMedications">Current Medications</Label>
        <Textarea id="currentMedications" placeholder="Enter current medications, separated by commas" />
      </div>
      <div>
        <Label htmlFor="familyHistory">Family History</Label>
        <Textarea
          id="familyHistory"
          placeholder="Enter family history (e.g., Father: Diabetes, Mother: Hypertension)"
        />
      </div>
      <div>
        <Label htmlFor="smokingStatus">Smoking Status</Label>
        <Select>
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
        <Select>
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
        <Label htmlFor="vaccinationHistory">Vaccination History</Label>
        <Textarea id="vaccinationHistory" placeholder="Enter vaccination history (e.g., Hepatitis B: 2020-02-10)" />
      </div>
    </div>
  )
}

function AdmissionAndVisits() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dateOfAdmission">Date of Admission</Label>
        <Input id="dateOfAdmission" type="date" />
      </div>
      <div>
        <Label htmlFor="doctorAssigned">Doctor Assigned</Label>
        <Input id="doctorAssigned" placeholder="Doctor's full name" />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Select>
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
        <Label htmlFor="symptomsComplaints">Symptoms/Complaints</Label>
        <Textarea id="symptomsComplaints" placeholder="Enter symptoms or complaints" />
      </div>
      <div>
        <Label htmlFor="provisionalDiagnosis">Provisional Diagnosis</Label>
        <Input id="provisionalDiagnosis" placeholder="Enter provisional diagnosis" />
      </div>
      <div>
        <Label htmlFor="labTestsOrdered">Lab Tests Ordered</Label>
        <Textarea id="labTestsOrdered" placeholder="Enter lab tests ordered, separated by commas" />
      </div>
      <div>
        <Label htmlFor="medicationsPrescribed">Medications Prescribed</Label>
        <Textarea
          id="medicationsPrescribed"
          placeholder="Enter medications prescribed (e.g., Paracetamol, 500mg, 3x daily, 5 days)"
        />
      </div>
      <div>
        <Label htmlFor="proceduresPerformed">Procedures Performed</Label>
        <Textarea id="proceduresPerformed" placeholder="Enter procedures performed, separated by commas" />
      </div>
      <div>
        <Label htmlFor="treatmentPlan">Treatment Plan</Label>
        <Textarea id="treatmentPlan" placeholder="Enter treatment plan" />
      </div>
      <div>
        <Label htmlFor="followUpDate">Follow-up Date</Label>
        <Input id="followUpDate" type="date" />
      </div>
    </div>
  )
}

function VitalSigns() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="temperature">Temperature (°C)</Label>
        <Input id="temperature" type="number" step="0.1" placeholder="37.5" />
      </div>
      <div>
        <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
        <Input id="bloodPressure" placeholder="120/80" />
      </div>
      <div>
        <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
        <Input id="heartRate" type="number" placeholder="75" />
      </div>
      <div>
        <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
        <Input id="respiratoryRate" type="number" placeholder="16" />
      </div>
      <div>
        <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
        <Input id="oxygenSaturation" type="number" placeholder="98" />
      </div>
      <div>
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input id="weight" type="number" step="0.1" placeholder="75.4" />
      </div>
      <div>
        <Label htmlFor="height">Height (m)</Label>
        <Input id="height" type="number" step="0.01" placeholder="1.75" />
      </div>
    </div>
  )
}

function TestResultsAndReports() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="testName">Test Name</Label>
        <Input id="testName" placeholder="e.g., Blood Sugar Test" />
      </div>
      <div>
        <Label htmlFor="testDate">Test Date</Label>
        <Input id="testDate" type="date" />
      </div>
      <div>
        <Label htmlFor="testResult">Test Result</Label>
        <Textarea id="testResult" placeholder="Enter test result (e.g., Fasting: 90 mg/dL, Postprandial: 140 mg/dL)" />
      </div>
      <div>
        <Label htmlFor="doctorComments">Doctor's Comments</Label>
        <Textarea id="doctorComments" placeholder="Enter doctor's comments on the test results" />
      </div>
    </div>
  )
}

function DischargeSummary() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="dischargeDate">Discharge Date</Label>
        <Input id="dischargeDate" type="date" />
      </div>
      <div>
        <Label htmlFor="finalDiagnosis">Final Diagnosis</Label>
        <Input id="finalDiagnosis" placeholder="Enter final diagnosis" />
      </div>
      <div>
        <Label htmlFor="medicationsForHome">Medications for Home</Label>
        <Textarea id="medicationsForHome" placeholder="Enter medications for home (e.g., Ibuprofen, 400mg, 5 days)" />
      </div>
      <div>
        <Label htmlFor="dischargeInstructions">Discharge Instructions</Label>
        <Textarea id="dischargeInstructions" placeholder="Enter discharge instructions" />
      </div>
      <div>
        <Label htmlFor="nextFollowUp">Next Follow-Up</Label>
        <Input id="nextFollowUp" type="date" />
      </div>
    </div>
  )
}

function DigitalDocumentsAndAttachments() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="scannedIdCard">Scanned ID Card</Label>
        <Input id="scannedIdCard" type="file" accept=".jpeg,.jpg,.png,.pdf" />
      </div>
      <div>
        <Label htmlFor="labTestReports">Lab Test Reports</Label>
        <Input id="labTestReports" type="file" accept=".pdf" multiple />
      </div>
      <div>
        <Label htmlFor="imagingReports">Imaging Reports</Label>
        <Input id="imagingReports" type="file" accept=".dcm,.jpeg,.jpg,.png" multiple />
      </div>
    </div>
  )
}
