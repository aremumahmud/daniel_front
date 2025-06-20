"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Calendar, User, Activity } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const medicalRecords = [
  {
    id: 1,
    date: "2024-01-15",
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    type: "Consultation",
    diagnosis: "Hypertension Follow-up",
    status: "Completed",
    notes: "Patient's blood pressure is well controlled with current medication. Continue current regimen.",
    prescriptions: ["Lisinopril 10mg daily"],
    vitals: {
      bloodPressure: "118/76",
      heartRate: "68 bpm",
      temperature: "98.4°F",
      weight: "164 lbs",
    },
    labResults: [],
    attachments: ["ECG_Report_Jan15.pdf", "Blood_Pressure_Log.pdf"],
  },
  {
    id: 2,
    date: "2024-01-10",
    doctor: "Dr. Michael Brown",
    specialty: "General Practitioner",
    type: "Annual Physical",
    diagnosis: "Routine Physical Examination",
    status: "Completed",
    notes: "Overall health is good. Recommended annual screenings are up to date.",
    prescriptions: ["Multivitamin daily"],
    vitals: {
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      temperature: "98.6°F",
      weight: "165 lbs",
    },
    labResults: [
      { test: "Complete Blood Count", result: "Normal", date: "2024-01-10" },
      { test: "Lipid Panel", result: "Normal", date: "2024-01-10" },
      { test: "Glucose", result: "95 mg/dL", date: "2024-01-10" },
    ],
    attachments: ["Physical_Exam_Report.pdf", "Lab_Results_Jan10.pdf"],
  },
  {
    id: 3,
    date: "2024-01-05",
    doctor: "Dr. Emily Davis",
    specialty: "Endocrinologist",
    type: "Lab Results Review",
    diagnosis: "Diabetes Management",
    status: "Completed",
    notes: "HbA1c levels are within target range. Continue current diabetes management plan.",
    prescriptions: ["Metformin 500mg twice daily"],
    vitals: {
      bloodPressure: "122/78",
      heartRate: "70 bpm",
      temperature: "98.5°F",
      weight: "163 lbs",
    },
    labResults: [
      { test: "HbA1c", result: "6.8%", date: "2024-01-05" },
      { test: "Fasting Glucose", result: "110 mg/dL", date: "2024-01-05" },
    ],
    attachments: ["Diabetes_Management_Plan.pdf"],
  },
]

export function PatientRecords() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<(typeof medicalRecords)[0] | null>(null)

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || record.type.toLowerCase().includes(filterType.toLowerCase())
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All Records
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="consultation">Consultations</SelectItem>
            <SelectItem value="physical">Physical Exams</SelectItem>
            <SelectItem value="lab">Lab Results</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records List */}
      <div className="grid gap-4">
        {filteredRecords.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{record.diagnosis}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {record.doctor} - {record.specialty}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {record.date}
                      </div>
                      <div className="flex items-center">
                        <Activity className="mr-1 h-4 w-4" />
                        {record.type}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={record.status === "Completed" ? "default" : "secondary"}>{record.status}</Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedRecord?.diagnosis}</DialogTitle>
                        <DialogDescription>
                          {selectedRecord?.doctor} - {selectedRecord?.date}
                        </DialogDescription>
                      </DialogHeader>
                      {selectedRecord && (
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="vitals">Vitals</TabsTrigger>
                            <TabsTrigger value="labs">Lab Results</TabsTrigger>
                            <TabsTrigger value="attachments">Attachments</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overview" className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Clinical Notes</h4>
                              <p className="text-sm text-muted-foreground">{selectedRecord.notes}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Prescriptions</h4>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {selectedRecord.prescriptions.map((prescription, index) => (
                                  <li key={index}>{prescription}</li>
                                ))}
                              </ul>
                            </div>
                          </TabsContent>
                          <TabsContent value="vitals" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold">Blood Pressure</h4>
                                <p className="text-2xl font-bold">{selectedRecord.vitals.bloodPressure}</p>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold">Heart Rate</h4>
                                <p className="text-2xl font-bold">{selectedRecord.vitals.heartRate}</p>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold">Temperature</h4>
                                <p className="text-2xl font-bold">{selectedRecord.vitals.temperature}</p>
                              </div>
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold">Weight</h4>
                                <p className="text-2xl font-bold">{selectedRecord.vitals.weight}</p>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="labs" className="space-y-4">
                            {selectedRecord.labResults.length > 0 ? (
                              <div className="space-y-2">
                                {selectedRecord.labResults.map((lab, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                      <h4 className="font-semibold">{lab.test}</h4>
                                      <p className="text-sm text-muted-foreground">{lab.date}</p>
                                    </div>
                                    <Badge variant="outline">{lab.result}</Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground py-8">No lab results available</p>
                            )}
                          </TabsContent>
                          <TabsContent value="attachments" className="space-y-4">
                            <div className="space-y-2">
                              {selectedRecord.attachments.map((attachment, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{attachment}</span>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No records found</h3>
            <p className="text-muted-foreground">No medical records match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
