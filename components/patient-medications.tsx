"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Pill, Clock, AlertTriangle, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const medications = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    timeOfDay: "Morning",
    remaining: 15,
    total: 30,
    prescribedBy: "Dr. Sarah Johnson",
    prescribedDate: "2024-01-01",
    purpose: "Blood pressure management",
    sideEffects: ["Dry cough", "Dizziness"],
    instructions: "Take with or without food. Avoid potassium supplements.",
    status: "Active",
    reminders: true,
    nextRefill: "2024-02-15",
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    timeOfDay: "Morning & Evening",
    remaining: 45,
    total: 60,
    prescribedBy: "Dr. Emily Davis",
    prescribedDate: "2023-12-15",
    purpose: "Diabetes management",
    sideEffects: ["Nausea", "Stomach upset"],
    instructions: "Take with meals to reduce stomach upset.",
    status: "Active",
    reminders: true,
    nextRefill: "2024-02-01",
  },
  {
    id: 3,
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "Once daily",
    timeOfDay: "Morning",
    remaining: 8,
    total: 90,
    prescribedBy: "Dr. Michael Brown",
    prescribedDate: "2023-11-01",
    purpose: "Vitamin D deficiency",
    sideEffects: [],
    instructions: "Take with food for better absorption.",
    status: "Low Stock",
    reminders: false,
    nextRefill: "2024-01-25",
  },
]

const medicationHistory = [
  {
    id: 1,
    name: "Hydrochlorothiazide",
    dosage: "25mg",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "2023-06-01",
    endDate: "2023-12-31",
    reason: "Switched to Lisinopril for better efficacy",
    status: "Discontinued",
  },
  {
    id: 2,
    name: "Ibuprofen",
    dosage: "400mg",
    prescribedBy: "Dr. Michael Brown",
    startDate: "2023-10-15",
    endDate: "2023-10-25",
    reason: "Short-term pain relief",
    status: "Completed",
  },
]

export function PatientMedications() {
  const [selectedMedication, setSelectedMedication] = useState<(typeof medications)[0] | null>(null)
  const [activeTab, setActiveTab] = useState("current")

  const toggleReminder = (medicationId: number) => {
    // In a real app, this would update the medication reminder setting
    console.log(`Toggle reminder for medication ${medicationId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Low Stock":
        return "destructive"
      case "Discontinued":
        return "secondary"
      case "Completed":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStockLevel = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100
    if (percentage <= 20) return "critical"
    if (percentage <= 40) return "low"
    return "normal"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Medications</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Request Prescription
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button variant={activeTab === "current" ? "default" : "outline"} onClick={() => setActiveTab("current")}>
          Current Medications
        </Button>
        <Button variant={activeTab === "history" ? "default" : "outline"} onClick={() => setActiveTab("history")}>
          Medication History
        </Button>
      </div>

      {activeTab === "current" && (
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medications.filter((m) => m.status === "Active").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medications.filter((m) => m.status === "Low Stock").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reminders Set</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{medications.filter((m) => m.reminders).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Current Medications */}
          <div className="grid gap-4">
            {medications.map((medication) => (
              <Card key={medication.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Pill className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{medication.name}</h3>
                          <Badge variant={getStatusColor(medication.status)}>{medication.status}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {medication.dosage} - {medication.frequency} ({medication.timeOfDay})
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Prescribed by {medication.prescribedBy} for {medication.purpose}
                        </p>

                        {/* Stock Level */}
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Stock Level</span>
                            <span
                              className={`font-medium ${
                                getStockLevel(medication.remaining, medication.total) === "critical"
                                  ? "text-destructive"
                                  : getStockLevel(medication.remaining, medication.total) === "low"
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {medication.remaining}/{medication.total} pills
                            </span>
                          </div>
                          <Progress value={(medication.remaining / medication.total) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">Next refill due: {medication.nextRefill}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`reminder-${medication.id}`} className="text-sm">
                          Reminders
                        </Label>
                        <Switch
                          id={`reminder-${medication.id}`}
                          checked={medication.reminders}
                          onCheckedChange={() => toggleReminder(medication.id)}
                        />
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedMedication(medication)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedMedication?.name}</DialogTitle>
                            <DialogDescription>
                              {selectedMedication?.dosage} - {selectedMedication?.frequency}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedMedication && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Purpose</h4>
                                <p className="text-sm text-muted-foreground">{selectedMedication.purpose}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Instructions</h4>
                                <p className="text-sm text-muted-foreground">{selectedMedication.instructions}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Possible Side Effects</h4>
                                {selectedMedication.sideEffects.length > 0 ? (
                                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {selectedMedication.sideEffects.map((effect, index) => (
                                      <li key={index}>{effect}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No known side effects</p>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-1">Prescribed By</h4>
                                  <p className="text-sm text-muted-foreground">{selectedMedication.prescribedBy}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-1">Prescribed Date</h4>
                                  <p className="text-sm text-muted-foreground">{selectedMedication.prescribedDate}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        Refill Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div className="grid gap-4">
          {medicationHistory.map((medication) => (
            <Card key={medication.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <Pill className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{medication.name}</h3>
                        <Badge variant={getStatusColor(medication.status)}>{medication.status}</Badge>
                      </div>
                      <p className="text-muted-foreground">{medication.dosage}</p>
                      <p className="text-sm text-muted-foreground">Prescribed by {medication.prescribedBy}</p>
                      <p className="text-sm text-muted-foreground">
                        {medication.startDate} - {medication.endDate}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Reason: {medication.reason}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === "current" && medications.length === 0) ||
        (activeTab === "history" && medicationHistory.length === 0)) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Pill className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === "current" ? "No current medications" : "No medication history"}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === "current" ? "You don't have any active medications." : "No previous medications found."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
