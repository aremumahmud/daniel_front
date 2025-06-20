"use client"

import { useState } from "react"
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
import { Eye, EyeOff, Save, Download, Trash2 } from "lucide-react"

export function PatientSettings() {
  const [showPassword, setShowPassword] = useState(false)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1990-05-15",
    address: "123 Main St, City, State 12345",
    emergencyContact: "John Doe - +1 (555) 987-6543",
  })

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  })

  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    medicationReminders: true,
    testResults: true,
    healthNewsletter: false,
    emergencyAlerts: true,
  })

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "EST",
    dateFormat: "MM/DD/YYYY",
    theme: "system",
  })

  const handleSavePersonalInfo = () => {
    toast({
      title: "Personal information updated",
      description: "Your personal information has been saved successfully.",
    })
  }

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })
    setSecurity({ ...security, currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    })
  }

  const handleSavePreferences = () => {
    toast({
      title: "App preferences updated",
      description: "Your app preferences have been saved.",
    })
  }

  const handleDownloadData = () => {
    toast({
      title: "Data export initiated",
      description: "Your personal data export will be emailed to you within 24 hours.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requested",
      description: "Your account deletion request has been submitted. You will receive a confirmation email.",
      variant: "destructive",
    })
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
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={personalInfo.firstName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={personalInfo.lastName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
            />
          </div>
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
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={personalInfo.address}
              onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              value={personalInfo.emergencyContact}
              onChange={(e) => setPersonalInfo({ ...personalInfo, emergencyContact: e.target.value })}
            />
          </div>
          <Button onClick={handleSavePersonalInfo} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Personal Information
          </Button>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Privacy</CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch
              id="twoFactor"
              checked={security.twoFactorEnabled}
              onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
            />
          </div>
          <Button onClick={handleChangePassword} className="w-full">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified about upcoming appointments</p>
            </div>
            <Switch
              id="appointmentReminders"
              checked={notifications.appointmentReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="medicationReminders">Medication Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded to take your medications</p>
            </div>
            <Switch
              id="medicationReminders"
              checked={notifications.medicationReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, medicationReminders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="testResults">Test Results</Label>
              <p className="text-sm text-muted-foreground">Get notified when test results are available</p>
            </div>
            <Switch
              id="testResults"
              checked={notifications.testResults}
              onCheckedChange={(checked) => setNotifications({ ...notifications, testResults: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="healthNewsletter">Health Newsletter</Label>
              <p className="text-sm text-muted-foreground">Receive health tips and news</p>
            </div>
            <Switch
              id="healthNewsletter"
              checked={notifications.healthNewsletter}
              onCheckedChange={(checked) => setNotifications({ ...notifications, healthNewsletter: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emergencyAlerts">Emergency Alerts</Label>
              <p className="text-sm text-muted-foreground">Critical health alerts (recommended)</p>
            </div>
            <Switch
              id="emergencyAlerts"
              checked={notifications.emergencyAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, emergencyAlerts: checked })}
            />
          </div>
          <Button onClick={handleSaveNotifications} className="w-full">
            Save Notification Preferences
          </Button>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                <SelectItem value="CST">Central Time (CST)</SelectItem>
                <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                <SelectItem value="PST">Pacific Time (PST)</SelectItem>
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
          <Button onClick={handleSavePreferences} className="w-full">
            Save App Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Button onClick={handleDownloadData} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download My Data
            </Button>
            <div className="text-sm text-muted-foreground">
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
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
              <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back.</p>
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
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
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
