"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { doctorService } from "@/services/doctor.service"
import { authService } from "@/services/auth.service"
import { Save, User, Shield, Bell, Clock, DollarSign, Star, Stethoscope, GraduationCap, FileText } from "lucide-react"
import type { Doctor } from "@/lib/types/api"

export function DoctorSettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null)
  
  // Doctor Profile State
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    consultationFee: 0,
    isAvailable: true,
    workingHours: {
      monday: { start: "09:00", end: "17:00", isOff: false },
      tuesday: { start: "09:00", end: "17:00", isOff: false },
      wednesday: { start: "09:00", end: "17:00", isOff: false },
      thursday: { start: "09:00", end: "17:00", isOff: false },
      friday: { start: "09:00", end: "17:00", isOff: false },
      saturday: { start: "09:00", end: "13:00", isOff: true },
      sunday: { isOff: true },
    }
  })

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    appointmentCancellations: true,
    newPatientRegistrations: false,
    systemUpdates: true,
    marketingEmails: false,
    smsNotifications: true,
    emailNotifications: true,
    pushNotifications: true,
  })

  // Avatar State
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Account Status State
  const [accountStatus, setAccountStatus] = useState<any>(null)

  // Credentials State
  const [credentials, setCredentials] = useState({
    licenseNumber: "",
    experience: 0,
    education: [{ degree: "", institution: "", year: new Date().getFullYear() }],
    certifications: [""]
  })

  // Data Export State
  const [dataExport, setDataExport] = useState({
    format: "json",
    includePatientData: false,
    includeAppointments: true,
    includeMedicalRecords: true
  })
  const [exportStatus, setExportStatus] = useState<any>(null)

  // Load doctor profile
  useEffect(() => {
    const loadDoctorProfile = async () => {
      try {
        const profile = await doctorService.getProfile()
        setDoctorProfile(profile)

        // Transform working hours to match API structure
        const transformedWorkingHours = { ...profileData.workingHours }
        if (profile.workingHours) {
          Object.keys(profile.workingHours).forEach(day => {
            const daySchedule = profile.workingHours[day]
            if (daySchedule) {
              transformedWorkingHours[day] = {
                start: daySchedule.start || "09:00",
                end: daySchedule.end || "17:00",
                isOff: daySchedule.isOff || false
              }
            }
          })
        }

        setProfileData({
          firstName: profile.userId?.firstName || "",
          lastName: profile.userId?.lastName || "",
          email: profile.userId?.email || "",
          phone: profile.userId?.phone || "",
          specialization: profile.specialization || "",
          consultationFee: profile.consultationFee || 0,
          isAvailable: profile.isAvailable !== undefined ? profile.isAvailable : true,
          workingHours: transformedWorkingHours
        })

        // Set avatar preview if available
        if (profile.userId?.avatarUrl) {
          setAvatarPreview(profile.userId.avatarUrl)
        }

        // Load notification preferences
        try {
          const notificationPrefs = await doctorService.getNotificationPreferences()
          setNotifications(notificationPrefs)
        } catch (error) {
          console.error("Failed to load notification preferences:", error)
        }

        // Load account status
        try {
          const status = await doctorService.getAccountStatus()
          setAccountStatus(status)
        } catch (error) {
          console.error("Failed to load account status:", error)
        }

        // Set credentials from profile
        if (profile.licenseNumber || profile.experience || profile.education || profile.certifications) {
          setCredentials({
            licenseNumber: profile.licenseNumber || "",
            experience: profile.experience || 0,
            education: profile.education || [{ degree: "", institution: "", year: new Date().getFullYear() }],
            certifications: profile.certifications || [""]
          })
        }
      } catch (error) {
        console.error("Failed to load doctor profile:", error)
        toast({
          title: "Error",
          description: "Failed to load doctor profile",
          variant: "destructive",
        })
      }
    }

    if (user?.role === "doctor") {
      loadDoctorProfile()
    }
  }, [user])

  const handleSaveProfile = async () => {
    try {
      setLoading(true)

      // Update basic profile fields (firstName, lastName, phone)
      await doctorService.updateBasicProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone
      })

      // Update doctor-specific fields
      await doctorService.updateProfile({
        specialization: profileData.specialization,
        consultationFee: profileData.consultationFee,
        isAvailable: profileData.isAvailable,
        workingHours: profileData.workingHours
      })

      toast({
        title: "Profile updated",
        description: "Your doctor profile has been updated successfully.",
      })

      // Reload profile
      const updatedProfile = await doctorService.getProfile()
      setDoctorProfile(updatedProfile)
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      })
      return
    }

    if (security.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long and contain uppercase, lowercase, and number.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await doctorService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      })
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast({
        title: "Password change failed",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadAvatar = async () => {
    if (!avatarFile) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      const result = await doctorService.uploadAvatar(formData)

      setAvatarPreview(result.avatarUrl)
      setAvatarFile(null)

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated successfully.",
      })

      // Reload profile to get updated avatar URL
      const updatedProfile = await doctorService.getProfile()
      setDoctorProfile(updatedProfile)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setLoading(true)
      await doctorService.removeAvatar()

      setAvatarPreview(null)
      setAvatarFile(null)

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed successfully.",
      })

      // Reload profile
      const updatedProfile = await doctorService.getProfile()
      setDoctorProfile(updatedProfile)
    } catch (error) {
      toast({
        title: "Remove failed",
        description: error instanceof Error ? error.message : "Failed to remove avatar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setLoading(true)
      await doctorService.updateNotificationPreferences(notifications)

      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update notification preferences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCredentials = async () => {
    try {
      setLoading(true)
      const result = await doctorService.updateCredentials(credentials)

      toast({
        title: "Credentials submitted",
        description: "Your credentials have been submitted for admin approval.",
      })

      // Reload account status to show pending approval
      const status = await doctorService.getAccountStatus()
      setAccountStatus(status)
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update credentials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateAccount = async (reason: string, reactivationDate?: string) => {
    try {
      setLoading(true)
      const result = await doctorService.deactivateAccount({ reason, reactivationDate })

      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated successfully.",
      })

      // Reload account status
      const status = await doctorService.getAccountStatus()
      setAccountStatus(status)
    } catch (error) {
      toast({
        title: "Deactivation failed",
        description: error instanceof Error ? error.message : "Failed to deactivate account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateAccount = async () => {
    try {
      setLoading(true)
      await doctorService.reactivateAccount()

      toast({
        title: "Account reactivated",
        description: "Your account has been reactivated successfully.",
      })

      // Reload account status
      const status = await doctorService.getAccountStatus()
      setAccountStatus(status)
    } catch (error) {
      toast({
        title: "Reactivation failed",
        description: error instanceof Error ? error.message : "Failed to reactivate account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestDataExport = async () => {
    try {
      setLoading(true)
      const result = await doctorService.requestDataExport(dataExport)

      setExportStatus(result)

      toast({
        title: "Export requested",
        description: `Data export requested successfully. You'll receive an email when it's ready.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to request data export",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addEducation = () => {
    setCredentials({
      ...credentials,
      education: [...credentials.education, { degree: "", institution: "", year: new Date().getFullYear() }]
    })
  }

  const removeEducation = (index: number) => {
    setCredentials({
      ...credentials,
      education: credentials.education.filter((_, i) => i !== index)
    })
  }

  const addCertification = () => {
    setCredentials({
      ...credentials,
      certifications: [...credentials.certifications, ""]
    })
  }

  const removeCertification = (index: number) => {
    setCredentials({
      ...credentials,
      certifications: credentials.certifications.filter((_, i) => i !== index)
    })
  }

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Doctor Settings</h1>
        <p className="text-muted-foreground">
          Manage your doctor profile, availability, and account settings
        </p>
      </div>

      {/* Doctor Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Doctor Profile
          </CardTitle>
          <CardDescription>
            Update your professional information and consultation details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                value={profileData.specialization}
                onValueChange={(value) => setProfileData({ ...profileData, specialization: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="gastroenterology">Gastroenterology</SelectItem>
                  <SelectItem value="general-practice">General Practice</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="oncology">Oncology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="psychiatry">Psychiatry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
              <Input
                id="consultationFee"
                type="number"
                value={profileData.consultationFee}
                onChange={(e) => setProfileData({ ...profileData, consultationFee: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={profileData.isAvailable}
              onCheckedChange={(checked) => setProfileData({ ...profileData, isAvailable: checked })}
            />
            <Label htmlFor="isAvailable">Currently available for appointments</Label>
          </div>

          {doctorProfile && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{doctorProfile.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({doctorProfile.totalReviews} reviews)
                </span>
              </div>
              <Badge variant="outline">
                {doctorProfile.specialization}
              </Badge>
            </div>
          )}

          <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      {/* Avatar Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Upload or update your profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF. Max size: 5MB
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleUploadAvatar}
              disabled={!avatarFile || loading}
              variant="outline"
            >
              <User className="mr-2 h-4 w-4" />
              {loading ? "Uploading..." : "Upload Avatar"}
            </Button>
            {avatarPreview && (
              <Button
                variant="outline"
                onClick={handleRemoveAvatar}
                disabled={loading}
              >
                {loading ? "Removing..." : "Remove"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
          <CardDescription>
            Set your availability schedule for each day of the week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day.key} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-24">
                <Label className="font-medium">{day.label}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={!profileData.workingHours[day.key]?.isOff}
                  onCheckedChange={(checked) =>
                    setProfileData({
                      ...profileData,
                      workingHours: {
                        ...profileData.workingHours,
                        [day.key]: {
                          ...profileData.workingHours[day.key],
                          isOff: !checked,
                        },
                      },
                    })
                  }
                />
                <Label className="text-sm">Available</Label>
              </div>
              {!profileData.workingHours[day.key]?.isOff && (
                <>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">From:</Label>
                    <Input
                      type="time"
                      value={profileData.workingHours[day.key]?.start || "09:00"}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          workingHours: {
                            ...profileData.workingHours,
                            [day.key]: {
                              ...profileData.workingHours[day.key],
                              start: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">To:</Label>
                    <Input
                      type="time"
                      value={profileData.workingHours[day.key]?.end || "17:00"}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          workingHours: {
                            ...profileData.workingHours,
                            [day.key]: {
                              ...profileData.workingHours[day.key],
                              end: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-24"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Update your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={security.currentPassword}
              onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={security.newPassword}
              onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={security.confirmPassword}
              onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={loading || !security.currentPassword || !security.newPassword}
            variant="outline"
          >
            <Shield className="mr-2 h-4 w-4" />
            {loading ? "Updating..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming appointments
                </p>
              </div>
              <Switch
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, appointmentReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Appointment Cancellations</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when patients cancel appointments
                </p>
              </div>
              <Switch
                checked={notifications.appointmentCancellations}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, appointmentCancellations: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">New Patient Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new patients register
                </p>
              </div>
              <Switch
                checked={notifications.newPatientRegistrations}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newPatientRegistrations: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about system updates and maintenance
                </p>
              </div>
              <Switch
                checked={notifications.systemUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, systemUpdates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch
                checked={notifications.smsNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, smsNotifications: checked })
                }
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications} disabled={loading} variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Notification Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Credentials Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Update Professional Credentials
          </CardTitle>
          <CardDescription>
            Submit updates to your professional credentials (requires admin approval)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={credentials.licenseNumber}
                onChange={(e) => setCredentials({ ...credentials, licenseNumber: e.target.value })}
                placeholder="MD123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={credentials.experience}
                onChange={(e) => setCredentials({ ...credentials, experience: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Education</Label>
              <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                Add Education
              </Button>
            </div>
            {credentials.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => {
                      const newEducation = [...credentials.education]
                      newEducation[index].degree = e.target.value
                      setCredentials({ ...credentials, education: newEducation })
                    }}
                    placeholder="MD, PhD, etc."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => {
                      const newEducation = [...credentials.education]
                      newEducation[index].institution = e.target.value
                      setCredentials({ ...credentials, education: newEducation })
                    }}
                    placeholder="University name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1950"
                      max={new Date().getFullYear()}
                      value={edu.year}
                      onChange={(e) => {
                        const newEducation = [...credentials.education]
                        newEducation[index].year = parseInt(e.target.value) || new Date().getFullYear()
                        setCredentials({ ...credentials, education: newEducation })
                      }}
                    />
                    {credentials.education.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Certifications</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                Add Certification
              </Button>
            </div>
            {credentials.certifications.map((cert, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={cert}
                  onChange={(e) => {
                    const newCertifications = [...credentials.certifications]
                    newCertifications[index] = e.target.value
                    setCredentials({ ...credentials, certifications: newCertifications })
                  }}
                  placeholder="Certification name"
                  className="flex-1"
                />
                {credentials.certifications.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeCertification(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {accountStatus?.pendingCredentialsUpdate && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Pending Approval:</strong> Your credentials update submitted on{" "}
                {new Date(accountStatus.pendingCredentialsUpdate.submittedAt).toLocaleDateString()}{" "}
                is awaiting admin approval.
              </p>
            </div>
          )}

          <Button onClick={handleUpdateCredentials} disabled={loading}>
            <GraduationCap className="mr-2 h-4 w-4" />
            {loading ? "Submitting..." : "Submit for Approval"}
          </Button>
        </CardContent>
      </Card>

      {/* Professional Information */}
      {doctorProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Professional Information
            </CardTitle>
            <CardDescription>
              Your professional credentials and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">License Number</Label>
                <p className="text-sm text-muted-foreground">{doctorProfile.licenseNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Experience</Label>
                <p className="text-sm text-muted-foreground">{doctorProfile.experience} years</p>
              </div>
            </div>

            {doctorProfile.education && doctorProfile.education.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Education</Label>
                <div className="space-y-2 mt-2">
                  {doctorProfile.education.map((edu, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doctorProfile.certifications && doctorProfile.certifications.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Certifications</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {doctorProfile.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                To update professional credentials, please contact the administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Management
          </CardTitle>
          <CardDescription>
            Manage your account status and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {accountStatus && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Account Status</Label>
                  <p className="capitalize">{accountStatus.accountStatus}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Available for Appointments</Label>
                  <p>{accountStatus.isAvailable ? "Yes" : "No"}</p>
                </div>
              </div>
              {accountStatus.deactivatedAt && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Deactivated Since</Label>
                  <p>{new Date(accountStatus.deactivatedAt).toLocaleDateString()}</p>
                  {accountStatus.reactivationDate && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium">Scheduled Reactivation</Label>
                      <p>{new Date(accountStatus.reactivationDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {accountStatus?.accountStatus === "active" ? (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Deactivate Account</h4>
                <p className="text-sm text-red-600 mb-4">
                  Temporarily deactivate your account. You won't be able to receive new appointments.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt("Please provide a reason for deactivation:")
                    if (reason) {
                      const reactivationDate = prompt("Optional: Enter reactivation date (YYYY-MM-DD):")
                      handleDeactivateAccount(reason, reactivationDate || undefined)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? "Deactivating..." : "Deactivate Account"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Reactivate Account</h4>
                <p className="text-sm text-green-600 mb-4">
                  Reactivate your account to start receiving appointments again.
                </p>
                <Button
                  variant="default"
                  onClick={handleReactivateAccount}
                  disabled={loading}
                >
                  {loading ? "Reactivating..." : "Reactivate Account"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export your data for backup or transfer purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select
                value={dataExport.format}
                onValueChange={(value) => setDataExport({ ...dataExport, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Include Data</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeAppointments"
                  checked={dataExport.includeAppointments}
                  onCheckedChange={(checked) =>
                    setDataExport({ ...dataExport, includeAppointments: checked })
                  }
                />
                <Label htmlFor="includeAppointments">Appointments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeMedicalRecords"
                  checked={dataExport.includeMedicalRecords}
                  onCheckedChange={(checked) =>
                    setDataExport({ ...dataExport, includeMedicalRecords: checked })
                  }
                />
                <Label htmlFor="includeMedicalRecords">Medical Records</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="includePatientData"
                  checked={dataExport.includePatientData}
                  onCheckedChange={(checked) =>
                    setDataExport({ ...dataExport, includePatientData: checked })
                  }
                />
                <Label htmlFor="includePatientData">Patient Data (requires consent)</Label>
              </div>
            </div>
          </div>

          {exportStatus && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Export Requested:</strong> Export ID {exportStatus.exportId}
                <br />
                Estimated completion time: {exportStatus.estimatedTime}
                <br />
                You'll receive an email at {exportStatus.notificationEmail} when ready.
              </p>
            </div>
          )}

          <Button onClick={handleRequestDataExport} disabled={loading}>
            <FileText className="mr-2 h-4 w-4" />
            {loading ? "Requesting..." : "Request Data Export"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
