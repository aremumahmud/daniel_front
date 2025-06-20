"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService } from "@/services/admin.service"
import { toast } from "@/hooks/use-toast"

export function ApiTestDebug() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const testApi = async (apiName: string, apiCall: () => Promise<any>) => {
    try {
      setLoading(prev => ({ ...prev, [apiName]: true }))
      const result = await apiCall()
      setResults(prev => ({ ...prev, [apiName]: { success: true, data: result } }))
      toast({
        title: "Success",
        description: `${apiName} API call successful`,
      })
    } catch (error) {
      console.error(`${apiName} API failed:`, error)
      setResults(prev => ({ 
        ...prev, 
        [apiName]: { 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        } 
      }))
      toast({
        title: "Error",
        description: `${apiName} API call failed: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
    } finally {
      setLoading(prev => ({ ...prev, [apiName]: false }))
    }
  }

  const testDoctorsApi = () => testApi("getDoctors", () => 
    adminService.getDoctors({ limit: 5, page: 1 })
  )

  const testUsersApi = () => testApi("getUsers", () => 
    adminService.getUsers({ role: "doctor", limit: 5, page: 1 })
  )

  const testAdminOverview = () => testApi("getAdminOverview", () => 
    adminService.getAdminOverview()
  )

  const testPatientStatistics = () => testApi("getPatientStatistics", () => 
    adminService.getPatientStatistics()
  )

  const testCreateDoctor = () => testApi("createDoctor", () => 
    adminService.createDoctor({
      firstName: "Test",
      lastName: "Doctor",
      email: `test.doctor.${Date.now()}@example.com`,
      licenseNumber: `TEST-${Date.now()}`,
      specialization: "General Medicine"
    })
  )

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">API Debug Panel</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Doctors API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testDoctorsApi} 
              disabled={loading.getDoctors}
              className="w-full"
            >
              {loading.getDoctors ? "Testing..." : "Test getDoctors"}
            </Button>
            {results.getDoctors && (
              <div className="text-xs">
                <p className={results.getDoctors.success ? "text-green-600" : "text-red-600"}>
                  {results.getDoctors.success ? "✓ Success" : "✗ Failed"}
                </p>
                {results.getDoctors.success && (
                  <p>Found {results.getDoctors.data?.doctors?.length || 0} doctors</p>
                )}
                {!results.getDoctors.success && (
                  <p>{results.getDoctors.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users API (Fallback)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testUsersApi} 
              disabled={loading.getUsers}
              className="w-full"
            >
              {loading.getUsers ? "Testing..." : "Test getUsers"}
            </Button>
            {results.getUsers && (
              <div className="text-xs">
                <p className={results.getUsers.success ? "text-green-600" : "text-red-600"}>
                  {results.getUsers.success ? "✓ Success" : "✗ Failed"}
                </p>
                {results.getUsers.success && (
                  <p>Found {results.getUsers.data?.users?.length || 0} doctor users</p>
                )}
                {!results.getUsers.success && (
                  <p>{results.getUsers.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testAdminOverview} 
              disabled={loading.getAdminOverview}
              className="w-full"
            >
              {loading.getAdminOverview ? "Testing..." : "Test Overview"}
            </Button>
            {results.getAdminOverview && (
              <div className="text-xs">
                <p className={results.getAdminOverview.success ? "text-green-600" : "text-red-600"}>
                  {results.getAdminOverview.success ? "✓ Success" : "✗ Failed"}
                </p>
                {results.getAdminOverview.success && (
                  <p>Doctors: {results.getAdminOverview.data?.quickStats?.totalDoctors || 0}</p>
                )}
                {!results.getAdminOverview.success && (
                  <p>{results.getAdminOverview.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testPatientStatistics} 
              disabled={loading.getPatientStatistics}
              className="w-full"
            >
              {loading.getPatientStatistics ? "Testing..." : "Test Patients"}
            </Button>
            {results.getPatientStatistics && (
              <div className="text-xs">
                <p className={results.getPatientStatistics.success ? "text-green-600" : "text-red-600"}>
                  {results.getPatientStatistics.success ? "✓ Success" : "✗ Failed"}
                </p>
                {results.getPatientStatistics.success && (
                  <p>Patients: {results.getPatientStatistics.data?.overview?.totalPatients || 0}</p>
                )}
                {!results.getPatientStatistics.success && (
                  <p>{results.getPatientStatistics.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Doctor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testCreateDoctor} 
              disabled={loading.createDoctor}
              className="w-full"
            >
              {loading.createDoctor ? "Creating..." : "Test Create"}
            </Button>
            {results.createDoctor && (
              <div className="text-xs">
                <p className={results.createDoctor.success ? "text-green-600" : "text-red-600"}>
                  {results.createDoctor.success ? "✓ Success" : "✗ Failed"}
                </p>
                {results.createDoctor.success && (
                  <p>Created doctor with ID: {results.createDoctor.data?.doctor?._id}</p>
                )}
                {!results.createDoctor.success && (
                  <p>{results.createDoctor.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded">
            {JSON.stringify(results, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
