"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, Activity, Bell } from "lucide-react"
import { DoctorSideNav } from "@/components/doctor-side-nav"
import { DoctorAppointments } from "@/components/doctor-appointments"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

const upcomingAppointments = [
  {
    id: 1,
    patient: "Sarah Johnson",
    time: "09:00 AM",
    type: "Follow-up",
    status: "confirmed",
    avatar: "/placeholder.svg?height=40&width=40&text=SJ",
  },
  {
    id: 2,
    patient: "Michael Brown",
    time: "10:30 AM",
    type: "Consultation",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40&text=MB",
  },
  {
    id: 3,
    patient: "Emily Davis",
    time: "02:00 PM",
    type: "Check-up",
    status: "confirmed",
    avatar: "/placeholder.svg?height=40&width=40&text=ED",
  },
  {
    id: 4,
    patient: "David Wilson",
    time: "03:30 PM",
    type: "Emergency",
    status: "urgent",
    avatar: "/placeholder.svg?height=40&width=40&text=DW",
  },
]

const recentPatients = [
  {
    id: 1,
    name: "Jane Doe",
    lastVisit: "2024-01-15",
    condition: "Hypertension",
    status: "Stable",
    avatar: "/placeholder.svg?height=40&width=40&text=JD",
  },
  {
    id: 2,
    name: "Robert Smith",
    lastVisit: "2024-01-14",
    condition: "Diabetes",
    status: "Monitoring",
    avatar: "/placeholder.svg?height=40&width=40&text=RS",
  },
  {
    id: 3,
    name: "Lisa Taylor",
    lastVisit: "2024-01-13",
    condition: "Asthma",
    status: "Improved",
    avatar: "/placeholder.svg?height=40&width=40&text=LT",
  },
]

const notifications = [
  {
    id: 1,
    message: "Lab results ready for Sarah Johnson",
    time: "5 minutes ago",
    type: "lab",
  },
  {
    id: 2,
    message: "New appointment request from John Smith",
    time: "15 minutes ago",
    type: "appointment",
  },
  {
    id: 3,
    message: "Prescription refill needed for Emily Davis",
    time: "1 hour ago",
    type: "prescription",
  },
]

// Doctor Patients Component
function DoctorPatients() {
  const patients = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 34,
      condition: "Hypertension",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-01-22",
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
    },
    {
      id: 2,
      name: "Michael Brown",
      age: 45,
      condition: "Diabetes Type 2",
      lastVisit: "2024-01-10",
      nextAppointment: "2024-01-25",
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40&text=MB",
    },
    {
      id: 3,
      name: "Emily Davis",
      age: 28,
      condition: "Asthma",
      lastVisit: "2024-01-08",
      nextAppointment: "2024-01-30",
      status: "Active",
      avatar: "/placeholder.svg?height=40&width=40&text=ED",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Patients</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Patient</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Register a new patient in the system</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="patient@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance Provider</Label>
                <Input id="insurance" placeholder="Insurance company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Initial Consultation Reason</Label>
                <Textarea id="reason" placeholder="Reason for first visit" />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() =>
                  toast({ title: "Patient Added", description: "New patient has been registered successfully." })
                }
              >
                Add Patient
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Age: {patient.age} • {patient.condition}
                    </p>
                    <p className="text-sm text-muted-foreground">Last visit: {patient.lastVisit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{patient.status}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">Next: {patient.nextAppointment}</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      View Records
                    </Button>
                    <Button size="sm">Schedule</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Doctor Records Component
function DoctorRecords() {
  const records = [
    {
      id: 1,
      patient: "Sarah Johnson",
      date: "2024-01-15",
      type: "Consultation",
      diagnosis: "Hypertension",
      status: "Completed",
    },
    {
      id: 2,
      patient: "Michael Brown",
      date: "2024-01-10",
      type: "Follow-up",
      diagnosis: "Diabetes Type 2",
      status: "Completed",
    },
    {
      id: 3,
      patient: "Emily Davis",
      date: "2024-01-08",
      type: "Check-up",
      diagnosis: "Asthma",
      status: "Pending Review",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create New Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Medical Record</DialogTitle>
              <DialogDescription>Add a new medical record for a patient</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Select Patient</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient1">Sarah Johnson</SelectItem>
                    <SelectItem value="patient2">Michael Brown</SelectItem>
                    <SelectItem value="patient3">Emily Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="checkup">Check-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input id="diagnosis" placeholder="Primary diagnosis" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea id="symptoms" placeholder="Patient symptoms and observations" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment Plan</Label>
                <Textarea id="treatment" placeholder="Prescribed treatment and medications" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Any additional observations" />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() =>
                  toast({ title: "Record Created", description: "Medical record has been saved successfully." })
                }
              >
                Create Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
          <CardDescription>Latest medical records and consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{record.patient}</h3>
                  <p className="text-sm text-muted-foreground">
                    {record.type} • {record.date}
                  </p>
                  <p className="text-sm">{record.diagnosis}</p>
                </div>
                <div className="text-right">
                  <Badge variant={record.status === "Completed" ? "default" : "secondary"}>{record.status}</Badge>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Doctor Schedule Component
function DoctorSchedule() {
  const schedule = [
    { time: "09:00 AM", patient: "Sarah Johnson", type: "Follow-up", duration: "30 min" },
    { time: "10:00 AM", patient: "Michael Brown", type: "Consultation", duration: "45 min" },
    { time: "11:00 AM", patient: "Free Slot", type: "Available", duration: "30 min" },
    { time: "02:00 PM", patient: "Emily Davis", type: "Check-up", duration: "30 min" },
    { time: "03:00 PM", patient: "David Wilson", type: "Emergency", duration: "60 min" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedule</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Block Time</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block Time Slot</DialogTitle>
              <DialogDescription>Block time in your schedule for personal activities</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="blockDate">Date</Label>
                <Input id="blockDate" type="date" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lunch">Lunch Break</SelectItem>
                    <SelectItem value="meeting">Staff Meeting</SelectItem>
                    <SelectItem value="personal">Personal Time</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Additional details" />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() =>
                  toast({ title: "Time Blocked", description: "Time slot has been blocked successfully." })
                }
              >
                Block Time
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>January 20, 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium w-20">{slot.time}</div>
                  <div>
                    <p className="font-medium">{slot.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {slot.type} • {slot.duration}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {slot.patient !== "Free Slot" ? (
                    <>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="outline" size="sm">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm">Book Appointment</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Doctor Messages Component
function DoctorMessages() {
  const messages = [
    {
      id: 1,
      patient: "Sarah Johnson",
      message: "Hi Dr. Smith, I'm experiencing some side effects from the new medication.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      patient: "Michael Brown",
      message: "Thank you for the consultation yesterday. Feeling much better!",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: 3,
      patient: "Emily Davis",
      message: "Could we reschedule my appointment for next week?",
      time: "1 day ago",
      unread: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Compose Message</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
              <DialogDescription>Send a message to a patient</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Select Patient</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient1">Sarah Johnson</SelectItem>
                    <SelectItem value="patient2">Michael Brown</SelectItem>
                    <SelectItem value="patient3">Emily Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Message subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Type your message here..." className="min-h-32" />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() =>
                  toast({ title: "Message Sent", description: "Your message has been sent successfully." })
                }
              >
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Messages</CardTitle>
          <CardDescription>Recent messages from your patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border rounded-lg ${message.unread ? "bg-blue-50 dark:bg-blue-950" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{message.patient}</h3>
                  <div className="flex items-center gap-2">
                    {message.unread && <Badge variant="destructive">New</Badge>}
                    <span className="text-sm text-muted-foreground">{message.time}</span>
                  </div>
                </div>
                <p className="text-sm">{message.message}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    Mark as Read
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Doctor Settings Component
function DoctorSettings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input className="w-full mt-1 p-2 border rounded-md" defaultValue="Dr. John Smith" />
            </div>
            <div>
              <label className="text-sm font-medium">Specialization</label>
              <input className="w-full mt-1 p-2 border rounded-md" defaultValue="Cardiologist" />
            </div>
            <div>
              <label className="text-sm font-medium">License Number</label>
              <input className="w-full mt-1 p-2 border rounded-md" defaultValue="MD123456" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability Settings</CardTitle>
            <CardDescription>Manage your working hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Working Days</label>
              <div className="mt-2 space-y-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Working Hours</label>
              <div className="flex gap-2 mt-1">
                <input type="time" className="p-2 border rounded-md" defaultValue="09:00" />
                <span className="self-center">to</span>
                <input type="time" className="p-2 border rounded-md" defaultValue="17:00" />
              </div>
            </div>
            <Button>Update Schedule</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS notifications</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Appointment reminders</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Patient messages</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
            <Button>Save Preferences</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <input type="password" className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium">New Password</label>
              <input type="password" className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm New Password</label>
              <input type="password" className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <Button>Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Good morning, Dr. Smith</h1>
                <p className="text-muted-foreground">You have 4 appointments today</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                    <Badge variant="destructive" className="ml-2">
                      3
                    </Badge>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription>Recent alerts and updates</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant={
                              notification.type === "lab"
                                ? "default"
                                : notification.type === "appointment"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {notification.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm">{notification.message}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            Mark as Read
                          </Button>
                          <Button size="sm">Take Action</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">2 confirmed, 1 pending, 1 urgent</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">+3 new this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">3 lab results, 5 consultations</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">Based on 45 reviews</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Today's Appointments */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Today's Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments for today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={appointment.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {appointment.patient
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appointment.patient}</p>
                          <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.time}</p>
                        <Badge
                          variant={
                            appointment.status === "confirmed"
                              ? "default"
                              : appointment.status === "urgent"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Latest updates and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
                <CardDescription>Patients you've seen recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                      <Avatar>
                        <AvatarImage src={patient.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.condition}</p>
                        <p className="text-xs text-muted-foreground">Last visit: {patient.lastVisit}</p>
                      </div>
                      <Badge variant="outline">{patient.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )
      case "appointments":
        return <DoctorAppointments />
      case "patients":
        return <DoctorPatients />
      case "records":
        return <DoctorRecords />
      case "schedule":
        return <DoctorSchedule />
      case "messages":
        return <DoctorMessages />
      case "settings":
        return <DoctorSettings />
      default:
        return <div>Page not found</div>
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <DoctorSideNav activeTab={activeTab} setActiveTab={setActiveTab} />
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
