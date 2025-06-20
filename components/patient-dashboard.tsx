"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Activity, Heart, Thermometer, Weight } from "lucide-react"
import { PatientSideNav } from "@/components/patient-side-nav"
import { Progress } from "@/components/ui/progress"
import { PatientAppointments } from "@/components/patient-appointments"
import { PatientRecords } from "@/components/patient-records"
import { PatientMedications } from "@/components/patient-medications"
import { PatientHealthMetrics } from "@/components/patient-health-metrics"
import { PatientMessages } from "@/components/patient-messages"
import { PatientProfile } from "@/components/patient-profile"
import { PatientSettings } from "@/components/patient-settings"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { patientService } from "@/services/patient.service"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { PatientDashboard as PatientDashboardType } from "@/lib/types/api"

export function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState<PatientDashboardType | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  console.log("User:", user)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const data = await patientService.getDashboard()
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to load dashboard:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async (appointmentData: any) => {
    try {
      await patientService.bookAppointment(appointmentData)
      toast({
        title: "Success",
        description: "Appointment booked successfully",
      })
      loadDashboardData() // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return <PatientAppointments />
      case "records":
        return <PatientRecords />
      case "medications":
        return <PatientMedications />
      case "health":
        return <PatientHealthMetrics />
      case "messages":
        return <PatientMessages />
      case "profile":
        return <PatientProfile />
      case "settings":
        return <PatientSettings />
      default:
        return (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Welcome back, {user?.firstName || "Patient"}</h1>
                <p className="text-muted-foreground">Here's your health overview</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                    <DialogDescription>Schedule an appointment with your healthcare provider</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      handleBookAppointment({
                        doctorId: formData.get("doctor"),
                        appointmentDate: formData.get("date"),
                        appointmentTime: formData.get("time"),
                        type: formData.get("type"),
                        reason: formData.get("reason"),
                        priority: "medium",
                      })
                    }}
                  >
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Select Doctor</Label>
                        <Select name="doctor" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dr-sarah">Dr. Sarah Johnson - Cardiologist</SelectItem>
                            <SelectItem value="dr-michael">Dr. Michael Brown - General Practitioner</SelectItem>
                            <SelectItem value="dr-emily">Dr. Emily Davis - Endocrinologist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Preferred Date</Label>
                        <Input name="date" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Preferred Time</Label>
                        <Select name="time" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="09:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Appointment Type</Label>
                        <Select name="type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="check-up">Check-up</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Visit</Label>
                        <Textarea
                          name="reason"
                          placeholder="Describe your symptoms or reason for the appointment"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Book Appointment</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Health Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData?.recentMetrics?.find((m) => m.metricType === "blood_pressure")?.value ||
                          "120/80"}
                      </div>
                      <p className="text-xs text-muted-foreground">Normal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData?.recentMetrics?.find((m) => m.metricType === "heart_rate")?.value || "72"} bpm
                      </div>
                      <p className="text-xs text-muted-foreground">Normal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData?.recentMetrics?.find((m) => m.metricType === "temperature")?.value || "98.6"}°F
                      </div>
                      <p className="text-xs text-muted-foreground">Normal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Weight</CardTitle>
                      <Weight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData?.patient?.weight?.value || "165"} {dashboardData?.patient?.weight?.unit || "lbs"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        BMI: {dashboardData?.patient?.bmi?.toFixed(1) || "24.5"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Upcoming Appointments */}
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Upcoming Appointments</CardTitle>
                      <CardDescription>Your scheduled medical appointments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardData?.upcomingAppointments?.length ? (
                        dashboardData.upcomingAppointments.map((appointment) => (
                          <div
                            key={appointment._id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>{appointment.doctorId?.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Dr. {appointment.doctorId}</p>
                                <p className="text-sm text-muted-foreground">{appointment.type}</p>
                                <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">{appointment.appointmentTime}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No upcoming appointments</p>
                          <Button className="mt-2" onClick={() => setActiveTab("appointments")}>
                            Schedule an Appointment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Health Goals */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Health Goals</CardTitle>
                      <CardDescription>Your progress towards health goals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dashboardData?.healthGoals?.length ? (
                        dashboardData.healthGoals.map((goal) => (
                          <div key={goal._id} className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-sm text-muted-foreground">{goal.description}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>
                                  {goal.currentValue}/{goal.targetValue} {goal.unit}
                                </span>
                              </div>
                              <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No health goals set</p>
                          <Button variant="outline" className="mt-2" size="sm">
                            Set Goals
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Notifications */}
                {dashboardData?.notifications?.length ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Notifications</CardTitle>
                      <CardDescription>Important updates and reminders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification._id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <div>
                                <p className="font-medium">{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant={notification.isRead ? "outline" : "default"}>
                              {notification.isRead ? "Read" : "New"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            )}
          </>
        )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <PatientSideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
}
