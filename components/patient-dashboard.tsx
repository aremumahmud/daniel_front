"use client"

import { useState } from "react"
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

const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "2024-01-20",
    time: "10:00 AM",
    type: "Follow-up",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
  },
  {
    id: 2,
    doctor: "Dr. Michael Brown",
    specialty: "General Practitioner",
    date: "2024-01-25",
    time: "02:30 PM",
    type: "Check-up",
    avatar: "/placeholder.svg?height=40&width=40&text=MB",
  },
]

const recentRecords = [
  {
    id: 1,
    date: "2024-01-15",
    doctor: "Dr. Sarah Johnson",
    diagnosis: "Hypertension Follow-up",
    status: "Stable",
    type: "Consultation",
  },
  {
    id: 2,
    date: "2024-01-10",
    doctor: "Dr. Michael Brown",
    diagnosis: "Annual Physical",
    status: "Completed",
    type: "Check-up",
  },
  {
    id: 3,
    date: "2024-01-05",
    doctor: "Dr. Emily Davis",
    diagnosis: "Blood Work Results",
    status: "Normal",
    type: "Lab Results",
  },
]

const vitalSigns = {
  bloodPressure: { value: "120/80", status: "Normal", trend: "stable" },
  heartRate: { value: "72 bpm", status: "Normal", trend: "stable" },
  temperature: { value: "98.6°F", status: "Normal", trend: "stable" },
  weight: { value: "165 lbs", status: "Normal", trend: "down" },
}

const medications = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    remaining: 15,
    total: 30,
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    remaining: 45,
    total: 60,
  },
]

export function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

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
                <h1 className="text-4xl font-bold text-foreground">Welcome back, Jane</h1>
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
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Select Doctor</Label>
                      <Select>
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
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time</Label>
                      <Select>
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
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Textarea placeholder="Describe your symptoms or reason for the appointment" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Book Appointment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Health Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vitalSigns.bloodPressure.value}</div>
                  <p className="text-xs text-muted-foreground">{vitalSigns.bloodPressure.status}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vitalSigns.heartRate.value}</div>
                  <p className="text-xs text-muted-foreground">{vitalSigns.heartRate.status}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vitalSigns.temperature.value}</div>
                  <p className="text-xs text-muted-foreground">{vitalSigns.temperature.status}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Weight</CardTitle>
                  <Weight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vitalSigns.weight.value}</div>
                  <p className="text-xs text-muted-foreground">{vitalSigns.weight.status}</p>
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
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={appointment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {appointment.doctor
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appointment.doctor}</p>
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.date}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                    </div>
                  ))}
                  {upcomingAppointments.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No upcoming appointments</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="mt-2">Schedule an Appointment</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Book Your First Appointment</DialogTitle>
                            <DialogDescription>Get started with your healthcare journey</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label>Select Doctor</Label>
                              <Select>
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
                              <Label>Preferred Date</Label>
                              <Input type="date" />
                            </div>
                            <div className="space-y-2">
                              <Label>Reason for Visit</Label>
                              <Textarea placeholder="Describe your health concerns" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Schedule Appointment</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Medications */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                  <CardDescription>Your active prescriptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medications.map((medication) => (
                    <div key={medication.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{medication.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} - {medication.frequency}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Remaining</span>
                          <span>
                            {medication.remaining}/{medication.total}
                          </span>
                        </div>
                        <Progress value={(medication.remaining / medication.total) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Medical Records */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Medical Records</CardTitle>
                <CardDescription>Your latest medical visits and results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div>
                          <p className="font-medium">{record.diagnosis}</p>
                          <p className="text-sm text-muted-foreground">Dr. {record.doctor}</p>
                          <p className="text-sm text-muted-foreground">{record.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{record.status}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{record.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
