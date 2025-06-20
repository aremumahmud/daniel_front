"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientManagement } from "@/components/patient-management"
import { PatientDetails } from "@/components/patient-details"
import { PatientStatisticsComponent } from "@/components/patient-statistics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, User } from "lucide-react"

export function PatientsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId)
    setActiveTab("details")
  }

  const handleEditPatient = (patientId: string) => {
    router.push(`/dashboard/patients/${patientId}/edit`)
  }

  const handleBackToList = () => {
    setSelectedPatientId(null)
    setActiveTab("overview")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            Comprehensive patient management system with detailed records and analytics
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Patient List</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center space-x-2" disabled={!selectedPatientId}>
            <User className="w-4 h-4" />
            <span>Patient Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PatientManagement
            onViewPatient={handleViewPatient}
            onEditPatient={handleEditPatient}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Analytics</CardTitle>
              <CardDescription>
                Comprehensive statistics and insights about your patient population
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientStatisticsComponent />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {selectedPatientId ? (
            <PatientDetails
              patientId={selectedPatientId}
              onEdit={() => handleEditPatient(selectedPatientId)}
              onBack={handleBackToList}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Patient Selected</h3>
                <p className="text-muted-foreground">
                  Select a patient from the list to view their details
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
