"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, User, Stethoscope, MapPin, Clock } from "lucide-react"
import { adminService, type CreateDoctorData } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"

interface CreateDoctorDialogProps {
  onDoctorCreated?: () => void
}

export function CreateDoctorDialog({ onDoctorCreated }: CreateDoctorDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<CreateDoctorData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: undefined,
    specialization: "",
    licenseNumber: "",
    yearsExperience: 0,
    consultationFee: 0,
    languages: [],
    isAvailable: true,
    bio: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    workingHours: {
      monday: { start: "09:00", end: "17:00", available: true },
      tuesday: { start: "09:00", end: "17:00", available: true },
      wednesday: { start: "09:00", end: "17:00", available: true },
      thursday: { start: "09:00", end: "17:00", available: true },
      friday: { start: "09:00", end: "17:00", available: true },
      saturday: { start: "09:00", end: "13:00", available: false },
      sunday: { start: "09:00", end: "13:00", available: false },
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address!,
        [field]: value
      }
    }))
  }

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => {
      const currentWorkingHours = prev.workingHours || {}
      const currentDayHours = currentWorkingHours[day as keyof typeof currentWorkingHours] || {
        start: "09:00",
        end: "17:00",
        available: false
      }

      return {
        ...prev,
        workingHours: {
          ...currentWorkingHours,
          [day]: {
            ...currentDayHours,
            [field]: value
          }
        }
      }
    })
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      languages: checked
        ? [...(prev.languages || []), language]
        : (prev.languages || []).filter(lang => lang !== language)
    }))
  }

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return null
  }

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null // Phone is optional
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return "Please enter a valid phone number"
    }
    return null
  }

  const validateLicenseNumber = (license: string): string | null => {
    if (!license) return "License number is required"
    if (license.length < 3) return "License number must be at least 3 characters"
    return null
  }

  const validateExperience = (years: number): string | null => {
    if (years < 0) return "Years of experience cannot be negative"
    if (years > 70) return "Years of experience seems unrealistic"
    return null
  }

  const validateConsultationFee = (fee: number): string | null => {
    if (fee < 0) return "Consultation fee cannot be negative"
    if (fee > 10000) return "Consultation fee seems unrealistic"
    return null
  }

  const validateWorkingHours = (): string | null => {
    if (!formData.workingHours) return null

    const availableDays = Object.entries(formData.workingHours).filter(
      ([_, hours]) => hours?.available
    )

    if (availableDays.length === 0) {
      return "Doctor must be available at least one day per week"
    }

    for (const [day, hours] of availableDays) {
      if (!hours?.start || !hours?.end) {
        return `Please set working hours for ${day}`
      }

      const start = new Date(`2000-01-01T${hours.start}:00`)
      const end = new Date(`2000-01-01T${hours.end}:00`)

      if (start >= end) {
        return `End time must be after start time for ${day}`
      }
    }

    return null
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required field validation with trimming
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters"
    }

    if (!formData.specialization) {
      newErrors.specialization = "Specialization is required"
    }

    // Email validation
    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    // Phone validation
    const phoneError = validatePhone(formData.phone || "")
    if (phoneError) newErrors.phone = phoneError

    // License validation
    const licenseError = validateLicenseNumber(formData.licenseNumber)
    if (licenseError) newErrors.licenseNumber = licenseError

    // Experience validation
    const experienceError = validateExperience(formData.yearsExperience || 0)
    if (experienceError) newErrors.yearsExperience = experienceError

    // Consultation fee validation
    const feeError = validateConsultationFee(formData.consultationFee || 0)
    if (feeError) newErrors.consultationFee = feeError

    // Working hours validation
    const hoursError = validateWorkingHours()
    if (hoursError) newErrors.workingHours = hoursError

    // Date of birth validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()

      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future"
      } else {
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          // Adjust age if birthday hasn't occurred this year
        }

        if (age < 18) newErrors.dateOfBirth = "Doctor must be at least 18 years old"
        if (age > 100) newErrors.dateOfBirth = "Please enter a valid date of birth"
      }
    }

    // Additional validation for bio length
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = "Bio must be less than 1000 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Clean up the data before sending
      const cleanedData = {
        ...formData,
        phone: formData.phone?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        bio: formData.bio?.trim() || undefined,
        languages: formData.languages?.length ? formData.languages : undefined,
        yearsExperience: formData.yearsExperience || undefined,
        consultationFee: formData.consultationFee || undefined,
        address: formData.address && (
          formData.address.street ||
          formData.address.city ||
          formData.address.state ||
          formData.address.zipCode ||
          formData.address.country
        ) ? formData.address : undefined
      }

      console.log("Creating doctor with data:", cleanedData)
      const result = await adminService.createDoctor(cleanedData)
      console.log("Doctor created successfully:", result)

      toast({
        title: "Success",
        description: `Doctor ${formData.firstName} ${formData.lastName} has been created successfully`,
      })

      // Reset form and errors
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: undefined,
        specialization: "",
        licenseNumber: "",
        yearsExperience: 0,
        consultationFee: 0,
        languages: [],
        isAvailable: true,
        bio: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        workingHours: {
          monday: { start: "09:00", end: "17:00", available: true },
          tuesday: { start: "09:00", end: "17:00", available: true },
          wednesday: { start: "09:00", end: "17:00", available: true },
          thursday: { start: "09:00", end: "17:00", available: true },
          friday: { start: "09:00", end: "17:00", available: true },
          saturday: { start: "09:00", end: "13:00", available: false },
          sunday: { start: "09:00", end: "13:00", available: false },
        },
      })
      setErrors({})

      setOpen(false)
      onDoctorCreated?.()
    } catch (error) {
      console.error("Failed to create doctor:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create doctor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const specializations = [
    "Cardiology", "Dermatology", "Emergency Medicine", "Family Medicine", 
    "Internal Medicine", "Neurology", "Obstetrics & Gynecology", "Oncology",
    "Orthopedics", "Pediatrics", "Psychiatry", "Radiology", "Surgery", "Urology"
  ]

  const languages = [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Chinese", "Japanese", "Korean", "Arabic", "Hindi", "Russian"
  ]

  const weekDays = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Clear errors when dialog is closed
      setErrors({})
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Doctor</DialogTitle>
          <DialogDescription>
            Add a new doctor to the system. Fill in all required information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">
                <User className="mr-2 h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="professional">
                <Stethoscope className="mr-2 h-4 w-4" />
                Professional
              </TabsTrigger>
              <TabsTrigger value="address">
                <MapPin className="mr-2 h-4 w-4" />
                Address
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Clock className="mr-2 h-4 w-4" />
                Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => {
                          handleInputChange("firstName", e.target.value)
                          if (errors.firstName) {
                            setErrors(prev => ({ ...prev, firstName: "" }))
                          }
                        }}
                        className={errors.firstName ? "border-red-500" : ""}
                        required
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => {
                          handleInputChange("lastName", e.target.value)
                          if (errors.lastName) {
                            setErrors(prev => ({ ...prev, lastName: "" }))
                          }
                        }}
                        className={errors.lastName ? "border-red-500" : ""}
                        required
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          handleInputChange("email", e.target.value)
                          if (errors.email) {
                            setErrors(prev => ({ ...prev, email: "" }))
                          }
                        }}
                        className={errors.email ? "border-red-500" : ""}
                        required
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          handleInputChange("phone", e.target.value)
                          if (errors.phone) {
                            setErrors(prev => ({ ...prev, phone: "" }))
                          }
                        }}
                        className={errors.phone ? "border-red-500" : ""}
                        placeholder="e.g., +1 (555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => {
                          handleInputChange("dateOfBirth", e.target.value)
                          if (errors.dateOfBirth) {
                            setErrors(prev => ({ ...prev, dateOfBirth: "" }))
                          }
                        }}
                        className={errors.dateOfBirth ? "border-red-500" : ""}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specialization">Specialization *</Label>
                      <Select
                        value={formData.specialization}
                        onValueChange={(value) => {
                          handleInputChange("specialization", value)
                          if (errors.specialization) {
                            setErrors(prev => ({ ...prev, specialization: "" }))
                          }
                        }}
                      >
                        <SelectTrigger className={errors.specialization ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.specialization && (
                        <p className="text-sm text-red-500 mt-1">{errors.specialization}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => {
                          handleInputChange("licenseNumber", e.target.value)
                          if (errors.licenseNumber) {
                            setErrors(prev => ({ ...prev, licenseNumber: "" }))
                          }
                        }}
                        className={errors.licenseNumber ? "border-red-500" : ""}
                        placeholder="e.g., MD123456"
                        required
                      />
                      {errors.licenseNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.licenseNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearsExperience">Years of Experience</Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="0"
                        max="70"
                        value={formData.yearsExperience}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0
                          handleInputChange("yearsExperience", value)
                          if (errors.yearsExperience) {
                            setErrors(prev => ({ ...prev, yearsExperience: "" }))
                          }
                        }}
                        className={errors.yearsExperience ? "border-red-500" : ""}
                      />
                      {errors.yearsExperience && (
                        <p className="text-sm text-red-500 mt-1">{errors.yearsExperience}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
                      <Input
                        id="consultationFee"
                        type="number"
                        min="0"
                        max="10000"
                        step="0.01"
                        value={formData.consultationFee}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0
                          handleInputChange("consultationFee", value)
                          if (errors.consultationFee) {
                            setErrors(prev => ({ ...prev, consultationFee: "" }))
                          }
                        }}
                        className={errors.consultationFee ? "border-red-500" : ""}
                        placeholder="e.g., 150.00"
                      />
                      {errors.consultationFee && (
                        <p className="text-sm text-red-500 mt-1">{errors.consultationFee}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Languages Spoken</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {languages.map((language) => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={language}
                            checked={formData.languages?.includes(language) || false}
                            onCheckedChange={(checked) => handleLanguageChange(language, checked as boolean)}
                          />
                          <Label htmlFor={language} className="text-sm">{language}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">About / Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => {
                        handleInputChange("bio", e.target.value)
                        if (errors.bio) {
                          setErrors(prev => ({ ...prev, bio: "" }))
                        }
                      }}
                      className={errors.bio ? "border-red-500" : ""}
                      placeholder="Brief description about the doctor..."
                      rows={4}
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.bio && (
                        <p className="text-sm text-red-500">{errors.bio}</p>
                      )}
                      <p className="text-sm text-muted-foreground ml-auto">
                        {formData.bio?.length || 0}/1000 characters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) => handleInputChange("isAvailable", checked)}
                    />
                    <Label htmlFor="isAvailable">Available for appointments</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.address?.street || ""}
                      onChange={(e) => handleAddressChange("street", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.address?.city || ""}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.address?.state || ""}
                        onChange={(e) => handleAddressChange("state", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.address?.zipCode || ""}
                        onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.address?.country || ""}
                        onChange={(e) => handleAddressChange("country", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Working Hours</CardTitle>
                  {errors.workingHours && (
                    <p className="text-sm text-red-500">{errors.workingHours}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {weekDays.map((day) => (
                    <div key={day.key} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-20">
                        <Label className="font-medium">{day.label}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.workingHours?.[day.key as keyof typeof formData.workingHours]?.available || false}
                          onCheckedChange={(checked) => {
                            handleWorkingHoursChange(day.key, "available", checked)
                            if (errors.workingHours) {
                              setErrors(prev => ({ ...prev, workingHours: "" }))
                            }
                          }}
                        />
                        <Label className="text-sm">Available</Label>
                      </div>
                      {formData.workingHours?.[day.key as keyof typeof formData.workingHours]?.available && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">From:</Label>
                            <Input
                              type="time"
                              value={formData.workingHours[day.key as keyof typeof formData.workingHours]?.start || "09:00"}
                              onChange={(e) => {
                                handleWorkingHoursChange(day.key, "start", e.target.value)
                                if (errors.workingHours) {
                                  setErrors(prev => ({ ...prev, workingHours: "" }))
                                }
                              }}
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">To:</Label>
                            <Input
                              type="time"
                              value={formData.workingHours[day.key as keyof typeof formData.workingHours]?.end || "17:00"}
                              onChange={(e) => {
                                handleWorkingHoursChange(day.key, "end", e.target.value)
                                if (errors.workingHours) {
                                  setErrors(prev => ({ ...prev, workingHours: "" }))
                                }
                              }}
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                setErrors({})
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
