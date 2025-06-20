"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { authService } from "@/services/auth.service"
import { settingsService, type UserPreferences, type NotificationSettings } from "@/services/settings.service"
import { Eye, EyeOff, Save, Download, Trash2, User, Shield, Bell, Palette, Globe } from "lucide-react"

export function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    allergies: [] as string[],
    medicalHistory: [] as string[],
  })

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  })

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    systemUpdates: false,
    marketingEmails: false,
  })

  // App Preferences
  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    theme: "system",
  })

  // Data Export Preferences
  const [exportSettings, setExportSettings] = useState({
    format: "json" as "json" | "csv" | "pdf",
    includeDeleted: false,
    dataTypes: ["profile", "preferences", "notifications", "security_logs"] as ("profile" | "preferences" | "notifications" | "security_logs")[],
  })

  // Last export result
  const [lastExport, setLastExport] = useState<{
    downloadUrl: string
    format: string
    expiresAt: string
    completedAt: string
  } | null>(null)

  // Initialize form data and fetch complete profile when user data is available
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          // Get complete user profile from dedicated profile API
          const profileUser = await authService.getProfile()
          setPersonalInfo({
            firstName: profileUser.firstName || "",
            lastName: profileUser.lastName || "",
            email: profileUser.email || "",
            phone: profileUser.phone || "",
            dateOfBirth: profileUser.dateOfBirth || "",
            gender: profileUser.gender || "",
            bloodType: profileUser.bloodType || "",
            address: {
              street: profileUser.address?.street || "",
              city: profileUser.address?.city || "",
              state: profileUser.address?.state || "",
              zipCode: profileUser.address?.zipCode || "",
              country: profileUser.address?.country || "",
            },
            emergencyContact: {
              name: profileUser.emergencyContact?.name || "",
              phone: profileUser.emergencyContact?.phone || "",
              relationship: profileUser.emergencyContact?.relationship || "",
            },
            allergies: profileUser.allergies || [],
            medicalHistory: profileUser.medicalHistory || [],
          })
        } catch (error) {
          console.log("Could not load profile from API, using basic user data:", error)
          // Fallback to basic user data from auth context
          setPersonalInfo({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
            bloodType: user.bloodType || "",
            address: {
              street: user.address?.street || "",
              city: user.address?.city || "",
              state: user.address?.state || "",
              zipCode: user.address?.zipCode || "",
              country: user.address?.country || "",
            },
            emergencyContact: {
              name: user.emergencyContact?.name || "",
              phone: user.emergencyContact?.phone || "",
              relationship: user.emergencyContact?.relationship || "",
            },
            allergies: user.allergies || [],
            medicalHistory: user.medicalHistory || [],
          })
        }
      }
    }

    loadUserProfile()
  }, [user])

  // Load user preferences and notification settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load preferences
        const userPrefs = await settingsService.getUserPreferences()
        setPreferences(userPrefs)
      } catch (error) {
        console.log("Could not load preferences, using defaults")
      }

      try {
        // Load notification settings
        const notificationPrefs = await settingsService.getNotificationSettings()
        setNotifications(notificationPrefs)
      } catch (error) {
        console.log("Could not load notification settings, using defaults")
      }
    }

    if (user) {
      loadSettings()
    }
  }, [user])

  const handleSavePersonalInfo = async () => {
    try {
      setLoading(true)
      // Use the auth service updateProfile method which now calls /user/profile
      await updateProfile({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
        dateOfBirth: personalInfo.dateOfBirth,
        gender: personalInfo.gender as any,
        bloodType: personalInfo.bloodType as any,
        address: personalInfo.address,
        emergencyContact: personalInfo.emergencyContact,
        allergies: personalInfo.allergies,
        medicalHistory: personalInfo.medicalHistory,
      })
      // Success toast is handled by the updateProfile function in useAuth
      // Refresh the profile data after successful update
      try {
        const updatedProfile = await authService.getProfile()
        setPersonalInfo({
          firstName: updatedProfile.firstName || "",
          lastName: updatedProfile.lastName || "",
          email: updatedProfile.email || "",
          phone: updatedProfile.phone || "",
          dateOfBirth: updatedProfile.dateOfBirth || "",
          gender: updatedProfile.gender || "",
          bloodType: updatedProfile.bloodType || "",
          address: {
            street: updatedProfile.address?.street || "",
            city: updatedProfile.address?.city || "",
            state: updatedProfile.address?.state || "",
            zipCode: updatedProfile.address?.zipCode || "",
            country: updatedProfile.address?.country || "",
          },
          emergencyContact: {
            name: updatedProfile.emergencyContact?.name || "",
            phone: updatedProfile.emergencyContact?.phone || "",
            relationship: updatedProfile.emergencyContact?.relationship || "",
          },
          allergies: updatedProfile.allergies || [],
          medicalHistory: updatedProfile.medicalHistory || [],
        })
      } catch (refreshError) {
        console.log("Could not refresh profile data:", refreshError)
      }
    } catch (error) {
      // Error toast is handled by the updateProfile function in useAuth
      console.error("Failed to update personal information:", error)
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
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await authService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      })
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
      setSecurity({ ...security, currentPassword: "", newPassword: "", confirmPassword: "" })
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

  const handleSaveNotifications = async () => {
    try {
      setLoading(true)
      await settingsService.updateNotificationSettings(notifications)
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update notification settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setLoading(true)
      await settingsService.updateUserPreferences(preferences)
      toast({
        title: "App preferences updated",
        description: "Your app preferences have been saved.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update app preferences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadData = async () => {
    try {
      setLoading(true)
      const exportRequest = await settingsService.requestDataExport({
        format: exportSettings.format,
        includeDeleted: exportSettings.includeDeleted,
        dataTypes: exportSettings.dataTypes
      })

      // Store the export result for download link display
      if (exportRequest.downloadUrl) {
        setLastExport({
          downloadUrl: exportRequest.downloadUrl,
          format: exportRequest.format,
          expiresAt: exportRequest.expiresAt || "",
          completedAt: exportRequest.completedAt
        })

        // Automatically trigger download
        setTimeout(() => {
          handleDirectDownload()
        }, 500) // Small delay to show the success message first
      }

      toast({
        title: "Data export completed",
        description: exportRequest.downloadUrl
          ? `Your data export is downloading automatically. Also sent to ${exportRequest.sentToEmail}.`
          : `Your data export (${exportSettings.format.toUpperCase()}) has been sent to ${exportRequest.sentToEmail} successfully.`,
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

  const handleDirectDownload = async () => {
    if (lastExport?.downloadUrl) {
      try {
        // Fetch the file data
        const response = await fetch(lastExport.downloadUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to download file')
        }

        // Get the blob data
        const blob = await response.blob()

        // Create download link and trigger download
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        // Set filename based on format and timestamp
        const timestamp = new Date(lastExport.completedAt).toISOString().split('T')[0]
        const filename = `data-export-${timestamp}.${lastExport.format}`
        link.download = filename

        // Trigger download
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: "Download started",
          description: `Your ${lastExport.format.toUpperCase()} file is downloading...`,
        })
      } catch (error) {
        toast({
          title: "Download failed",
          description: error instanceof Error ? error.message : "Failed to download file",
          variant: "destructive",
        })
      }
    }
  }

  const handleClientSideDownload = async () => {
    try {
      setLoading(true)

      // Gather data from current state and API
      const exportData: any = {}

      if (exportSettings.dataTypes.includes("profile")) {
        exportData.profile = {
          ...personalInfo,
          role: user?.role,
          emailVerified: user?.emailVerified,
          isActive: user?.isActive,
          exportedAt: new Date().toISOString()
        }
      }

      if (exportSettings.dataTypes.includes("preferences")) {
        exportData.preferences = preferences
      }

      if (exportSettings.dataTypes.includes("notifications")) {
        exportData.notifications = notifications
      }

      if (exportSettings.dataTypes.includes("security_logs")) {
        exportData.security = {
          twoFactorEnabled: security.twoFactorEnabled,
          lastPasswordChange: new Date().toISOString(), // This would come from API
          accountCreated: user?.createdAt,
        }
      }

      // Add metadata
      exportData.metadata = {
        exportedAt: new Date().toISOString(),
        format: exportSettings.format,
        includeDeleted: exportSettings.includeDeleted,
        dataTypes: exportSettings.dataTypes,
        exportedBy: user?.email
      }

      let content: string
      let mimeType: string
      let fileExtension: string

      // Format the data based on selected format
      switch (exportSettings.format) {
        case "json":
          content = JSON.stringify(exportData, null, 2)
          mimeType = "application/json"
          fileExtension = "json"
          break

        case "csv":
          // Convert to CSV format
          content = convertToCSV(exportData)
          mimeType = "text/csv"
          fileExtension = "csv"
          break

        case "pdf":
          // Convert to text format (PDF generation would require additional library)
          content = convertToText(exportData)
          mimeType = "text/plain"
          fileExtension = "txt"
          break

        default:
          content = JSON.stringify(exportData, null, 2)
          mimeType = "application/json"
          fileExtension = "json"
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `data-export-${timestamp}.${fileExtension}`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download completed",
        description: `Your ${exportSettings.format.toUpperCase()} file has been downloaded successfully.`,
      })

    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to generate download",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const convertToCSV = (data: any): string => {
    const rows: string[] = []

    // Add headers
    rows.push("Section,Field,Value")

    // Convert nested object to CSV rows
    const flattenObject = (obj: any, prefix = "") => {
      Object.keys(obj).forEach(key => {
        const value = obj[key]
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          flattenObject(value, fullKey)
        } else {
          const csvValue = Array.isArray(value) ? value.join("; ") : String(value)
          rows.push(`"${prefix}","${key}","${csvValue.replace(/"/g, '""')}"`)
        }
      })
    }

    flattenObject(data)
    return rows.join("\n")
  }

  const convertToText = (data: any): string => {
    let text = "DATA EXPORT REPORT\n"
    text += "==================\n\n"
    text += `Generated: ${new Date().toLocaleString()}\n`
    text += `Format: ${exportSettings.format.toUpperCase()}\n`
    text += `User: ${user?.email}\n\n`

    const formatSection = (obj: any, title: string, indent = 0) => {
      const spaces = "  ".repeat(indent)
      text += `${spaces}${title}:\n`

      Object.keys(obj).forEach(key => {
        const value = obj[key]
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          formatSection(value, key, indent + 1)
        } else {
          const displayValue = Array.isArray(value) ? value.join(", ") : String(value)
          text += `${spaces}  ${key}: ${displayValue}\n`
        }
      })
      text += "\n"
    }

    Object.keys(data).forEach(section => {
      if (section !== "metadata") {
        formatSection(data[section], section.toUpperCase())
      }
    })

    return text
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      // In a real implementation, you'd want to prompt for password
      const deletionRequest = await settingsService.requestAccountDeletion({
        password: "", // This should be collected from user input
        reason: "User requested deletion"
      })
      toast({
        title: "Account deletion requested",
        description: `Your account will be deleted on ${new Date(deletionRequest.scheduledDate).toLocaleDateString()}. You can cancel before ${new Date(deletionRequest.cancellationDeadline).toLocaleDateString()}.`,
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to request account deletion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Email address cannot be changed. Contact support if you need to update it.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <Separator />

          {/* Personal Details */}
          {user?.role === "patient" && (
            <>
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={personalInfo.gender}
                      onValueChange={(value) => setPersonalInfo({ ...personalInfo, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={personalInfo.bloodType}
                      onValueChange={(value) => setPersonalInfo({ ...personalInfo, bloodType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
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
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Address Information</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={personalInfo.address.street}
                      onChange={(e) => setPersonalInfo({
                        ...personalInfo,
                        address: { ...personalInfo.address, street: e.target.value }
                      })}
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={personalInfo.address.city}
                        onChange={(e) => setPersonalInfo({
                          ...personalInfo,
                          address: { ...personalInfo.address, city: e.target.value }
                        })}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={personalInfo.address.state}
                        onChange={(e) => setPersonalInfo({
                          ...personalInfo,
                          address: { ...personalInfo.address, state: e.target.value }
                        })}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={personalInfo.address.zipCode}
                        onChange={(e) => setPersonalInfo({
                          ...personalInfo,
                          address: { ...personalInfo.address, zipCode: e.target.value }
                        })}
                        placeholder="ZIP Code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={personalInfo.address.country}
                        onChange={(e) => setPersonalInfo({
                          ...personalInfo,
                          address: { ...personalInfo.address, country: e.target.value }
                        })}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      value={personalInfo.emergencyContact.name}
                      onChange={(e) => setPersonalInfo({
                        ...personalInfo,
                        emergencyContact: { ...personalInfo.emergencyContact, name: e.target.value }
                      })}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={personalInfo.emergencyContact.phone}
                      onChange={(e) => setPersonalInfo({
                        ...personalInfo,
                        emergencyContact: { ...personalInfo.emergencyContact, phone: e.target.value }
                      })}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      value={personalInfo.emergencyContact.relationship}
                      onChange={(e) => setPersonalInfo({
                        ...personalInfo,
                        emergencyContact: { ...personalInfo.emergencyContact, relationship: e.target.value }
                      })}
                      placeholder="Relationship (e.g., spouse, parent)"
                    />
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          <Button onClick={handleSavePersonalInfo} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your password and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                placeholder="Enter your new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                placeholder="Confirm your new password"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="twoFactor"
              checked={security.twoFactorEnabled}
              onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
            />
            <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
          </div>
          <Button onClick={handleChangePassword} disabled={loading}>
            <Shield className="mr-2 h-4 w-4" />
            {loading ? "Updating..." : "Update Password"}
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
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming appointments
                </p>
              </div>
              <Switch
                id="appointmentReminders"
                checked={notifications.appointmentReminders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="systemUpdates">System Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about system maintenance and updates
                </p>
              </div>
              <Switch
                id="systemUpdates"
                checked={notifications.systemUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive newsletters and promotional content
                </p>
              </div>
              <Switch
                id="marketingEmails"
                checked={notifications.marketingEmails}
                onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
              />
            </div>
          </div>
          <Button onClick={handleSaveNotifications} disabled={loading}>
            <Bell className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Notification Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            App Preferences
          </CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences({ ...preferences, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="CST">Central Time</SelectItem>
                  <SelectItem value="MST">Mountain Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSavePreferences} disabled={loading}>
            <Palette className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save App Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>Manage your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Export Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Data Export Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Export Format</Label>
                <Select
                  value={exportSettings.format}
                  onValueChange={(value: "json" | "csv" | "pdf") => setExportSettings({ ...exportSettings, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON - Structured data format</SelectItem>
                    <SelectItem value="csv">CSV - Spreadsheet format</SelectItem>
                    <SelectItem value="pdf">PDF - Text-based report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data Types to Include</Label>
                <div className="space-y-2">
                  {[
                    { key: "profile", label: "Profile & Role-specific Data" },
                    { key: "preferences", label: "User Interface Preferences" },
                    { key: "notifications", label: "Notification Settings" },
                    { key: "security_logs", label: "Security Settings" }
                  ].map((dataType) => (
                    <div key={dataType.key} className="flex items-center space-x-2">
                      <Switch
                        id={dataType.key}
                        checked={exportSettings.dataTypes.includes(dataType.key as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExportSettings({
                              ...exportSettings,
                              dataTypes: [...exportSettings.dataTypes, dataType.key as any]
                            })
                          } else {
                            setExportSettings({
                              ...exportSettings,
                              dataTypes: exportSettings.dataTypes.filter(type => type !== dataType.key)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={dataType.key} className="text-sm">{dataType.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="includeDeleted"
                checked={exportSettings.includeDeleted}
                onCheckedChange={(checked) => setExportSettings({ ...exportSettings, includeDeleted: checked })}
              />
              <Label htmlFor="includeDeleted" className="text-sm">Include deleted data (if available)</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={handleClientSideDownload}
                className="w-full"
                disabled={loading || exportSettings.dataTypes.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Downloading..." : `Download ${exportSettings.format.toUpperCase()}`}
              </Button>
              <Button
                onClick={handleDownloadData}
                variant="outline"
                className="w-full"
                disabled={loading || exportSettings.dataTypes.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Processing..." : "Export & Email"}
              </Button>
            </div>

            {/* Download Link Display */}
            {lastExport && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Export Ready
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your {lastExport.format.toUpperCase()} export completed on{" "}
                    {new Date(lastExport.completedAt).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDirectDownload}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Download Now
                    </Button>
                    <Button
                      onClick={() => setLastExport(null)}
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Dismiss
                    </Button>
                  </div>
                  {lastExport.expiresAt && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Download link expires on {new Date(lastExport.expiresAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Download:</strong> Instantly download your data file to your device.
              </p>
              <p>
                <strong>Export & Email:</strong> Process via server and send to your email (with download link).
              </p>
            </div>
          </div>

          <Separator />

          {/* Privacy Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Privacy & Legal</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                •{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
              <p>
                •{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>
              </p>
              <p>
                •{" "}
                <a href="#" className="text-primary hover:underline">
                  Data Processing Agreement
                </a>
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">
                These actions are permanent and cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
