"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const patientData = {
  personalInfo: {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-06-15",
    gender: "Female",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    emergencyContact: "John Doe - +1 (555) 987-6543",
    avatar: "/placeholder.svg?height=100&width=100&text=JD",
  },
  medicalInfo: {
    bloodType: "O+",
    height: "5'6\"",
    weight: "165 lbs",
    allergies: ["Penicillin", "Shellfish"],
    chronicConditions: ["Hypertension", "Type 2 Diabetes"],
    currentMedications: ["Lisinopril 10mg", "Metformin 500mg"],
    insuranceProvider: "Blue Cross Blue Shield",
    insuranceId: "BC123456789",
    primaryPhysician: "Dr. Michael Brown",
  },
  preferences: {
    language: "English",
    communicationMethod: "Email",
    appointmentReminders: true,
    medicationReminders: true,
    healthTips: true,
    marketingEmails: false,
  },
}

export function PatientProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(patientData)

  const handleSave = () => {
    // In a real app, this would save to the server
    console.log("Saving profile data:", formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(patientData)
    setIsEditing(false)
  }

  const updatePersonalInfo = (field: string, value: string) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [field]: value,
      },
    })
  }

  const updateMedicalInfo = (field: string, value: string | string[]) => {
    setFormData({
      ...formData,
      medicalInfo: {
        ...formData.medicalInfo,
        [field]: value,
      },
    })
  }

  const updatePreferences = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="medical">Medical Information</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.personalInfo.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {formData.personalInfo.firstName[0]}
                    {formData.personalInfo.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && <Button variant="outline">Change Photo</Button>}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => updatePersonalInfo("firstName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => updatePersonalInfo("lastName", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => updatePersonalInfo("dateOfBirth", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.personalInfo.gender}
                    onValueChange={(value) => updatePersonalInfo("gender", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.personalInfo.address}
                      onChange={(e) => updatePersonalInfo("address", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.personalInfo.city}
                      onChange={(e) => updatePersonalInfo("city", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.personalInfo.state}
                      onChange={(e) => updatePersonalInfo("state", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.personalInfo.zipCode}
                      onChange={(e) => updatePersonalInfo("zipCode", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.personalInfo.emergencyContact}
                  onChange={(e) => updatePersonalInfo("emergencyContact", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Name - Phone Number"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Your medical history and health information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Medical Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    value={formData.medicalInfo.bloodType}
                    onValueChange={(value) => updateMedicalInfo("bloodType", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.medicalInfo.height}
                    onChange={(e) => updateMedicalInfo("height", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.medicalInfo.weight}
                    onChange={(e) => updateMedicalInfo("weight", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label>Allergies</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalInfo.allergies.map((allergy, index) => (
                    <Badge key={index} variant="secondary">
                      {allergy}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <Input
                    placeholder="Add allergies (comma separated)"
                    onBlur={(e) => {
                      if (e.target.value) {
                        const newAllergies = e.target.value.split(",").map((a) => a.trim())
                        updateMedicalInfo("allergies", [...formData.medicalInfo.allergies, ...newAllergies])
                        e.target.value = ""
                      }
                    }}
                  />
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="space-y-2">
                <Label>Chronic Conditions</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.medicalInfo.chronicConditions.map((condition, index) => (
                    <Badge key={index} variant="outline">
                      {condition}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <Input
                    placeholder="Add conditions (comma separated)"
                    onBlur={(e) => {
                      if (e.target.value) {
                        const newConditions = e.target.value.split(",").map((c) => c.trim())
                        updateMedicalInfo("chronicConditions", [
                          ...formData.medicalInfo.chronicConditions,
                          ...newConditions,
                        ])
                        e.target.value = ""
                      }
                    }}
                  />
                )}
              </div>

              {/* Insurance Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      value={formData.medicalInfo.insuranceProvider}
                      onChange={(e) => updateMedicalInfo("insuranceProvider", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceId">Insurance ID</Label>
                    <Input
                      id="insuranceId"
                      value={formData.medicalInfo.insuranceId}
                      onChange={(e) => updateMedicalInfo("insuranceId", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Primary Physician */}
              <div className="space-y-2">
                <Label htmlFor="primaryPhysician">Primary Physician</Label>
                <Input
                  id="primaryPhysician"
                  value={formData.medicalInfo.primaryPhysician}
                  onChange={(e) => updateMedicalInfo("primaryPhysician", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications and communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={formData.preferences.language}
                    onValueChange={(value) => updatePreferences("language", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="communicationMethod">Communication Method</Label>
                  <Select
                    value={formData.preferences.communicationMethod}
                    onValueChange={(value) => updatePreferences("communicationMethod", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="App">App Notifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive reminders about upcoming appointments</p>
                    </div>
                    <input
                      type="checkbox"
                      id="appointmentReminders"
                      checked={formData.preferences.appointmentReminders}
                      onChange={(e) => updatePreferences("appointmentReminders", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="medicationReminders">Medication Reminders</Label>
                      <p className="text-sm text-muted-foreground">Receive reminders to take your medications</p>
                    </div>
                    <input
                      type="checkbox"
                      id="medicationReminders"
                      checked={formData.preferences.medicationReminders}
                      onChange={(e) => updatePreferences("medicationReminders", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="healthTips">Health Tips</Label>
                      <p className="text-sm text-muted-foreground">Receive health tips and wellness information</p>
                    </div>
                    <input
                      type="checkbox"
                      id="healthTips"
                      checked={formData.preferences.healthTips}
                      onChange={(e) => updatePreferences("healthTips", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                    </div>
                    <input
                      type="checkbox"
                      id="marketingEmails"
                      checked={formData.preferences.marketingEmails}
                      onChange={(e) => updatePreferences("marketingEmails", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
