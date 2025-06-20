"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Activity, Weight, Plus, TrendingUp, TrendingDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { patientService } from "@/services/patient.service"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { HealthMetric } from "@/lib/types/api"

export function PatientHealthMetrics() {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null)
  const [newReading, setNewReading] = useState({
    metricType: "",
    value: "",
    systolicValue: "",
    diastolicValue: "",
    unit: "",
    notes: "",
    recordedAt: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    loadHealthMetrics()
  }, [])

  const loadHealthMetrics = async () => {
    try {
      setLoading(true)
      const data = await patientService.getHealthMetrics({ days: 30 })
      setHealthMetrics(data.metrics)
    } catch (error) {
      console.error("Failed to load health metrics:", error)
      toast({
        title: "Error",
        description: "Failed to load health metrics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddReading = async () => {
    try {
      const metricData = {
        metricType: newReading.metricType as any,
        value: newReading.metricType === "blood_pressure" ? undefined : Number.parseFloat(newReading.value),
        systolicValue:
          newReading.metricType === "blood_pressure" ? Number.parseFloat(newReading.systolicValue) : undefined,
        diastolicValue:
          newReading.metricType === "blood_pressure" ? Number.parseFloat(newReading.diastolicValue) : undefined,
        unit: newReading.unit,
        notes: newReading.notes,
        recordedAt: new Date(newReading.recordedAt),
      }

      await patientService.addHealthMetric(metricData)
      toast({
        title: "Success",
        description: "Health metric added successfully",
      })

      setNewReading({
        metricType: "",
        value: "",
        systolicValue: "",
        diastolicValue: "",
        unit: "",
        notes: "",
        recordedAt: new Date().toISOString().split("T")[0],
      })

      loadHealthMetrics()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add health metric",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "default"
      case "High":
        return "destructive"
      case "Low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "blood_pressure":
        return Heart
      case "heart_rate":
        return Activity
      case "weight":
        return Weight
      default:
        return Activity
    }
  }

  const groupedMetrics = healthMetrics.reduce(
    (acc, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = []
      }
      acc[metric.metricType].push(metric)
      return acc
    },
    {} as Record<string, HealthMetric[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Health Metrics</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Health Reading</DialogTitle>
              <DialogDescription>Record a new health metric reading</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Metric Type
                </Label>
                <Select
                  value={newReading.metricType}
                  onValueChange={(value) => setNewReading({ ...newReading, metricType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select metric type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                    <SelectItem value="heart_rate">Heart Rate</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="blood_glucose">Blood Glucose</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newReading.metricType === "blood_pressure" ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="systolic" className="text-right">
                      Systolic
                    </Label>
                    <Input
                      id="systolic"
                      value={newReading.systolicValue}
                      onChange={(e) => setNewReading({ ...newReading, systolicValue: e.target.value })}
                      placeholder="120"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="diastolic" className="text-right">
                      Diastolic
                    </Label>
                    <Input
                      id="diastolic"
                      value={newReading.diastolicValue}
                      onChange={(e) => setNewReading({ ...newReading, diastolicValue: e.target.value })}
                      placeholder="80"
                      className="col-span-3"
                    />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">
                    Value
                  </Label>
                  <Input
                    id="value"
                    value={newReading.value}
                    onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                    placeholder="Enter value"
                    className="col-span-3"
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit" className="text-right">
                  Unit
                </Label>
                <Input
                  id="unit"
                  value={newReading.unit}
                  onChange={(e) => setNewReading({ ...newReading, unit: e.target.value })}
                  placeholder="e.g., mmHg, bpm, kg"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newReading.recordedAt}
                  onChange={(e) => setNewReading({ ...newReading, recordedAt: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={newReading.notes}
                  onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddReading}>Add Reading</Button>
            </DialogFooter>
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
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(groupedMetrics).map(([metricType, metrics]) => {
              const latestMetric = metrics[metrics.length - 1]
              const Icon = getMetricIcon(metricType)

              return (
                <Card
                  key={metricType}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedMetric(latestMetric)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metricType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latestMetric.metricType === "blood_pressure"
                        ? `${latestMetric.systolicValue}/${latestMetric.diastolicValue}`
                        : latestMetric.value}{" "}
                      {latestMetric.unit}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="default">Normal</Badge>
                      {getTrendIcon("stable")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(latestMetric.recordedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Recent Readings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Readings</CardTitle>
              <CardDescription>Your latest health metric entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthMetrics.slice(0, 10).map((metric) => {
                  const Icon = getMetricIcon(metric.metricType)
                  return (
                    <div key={metric._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {metric.metricType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(metric.recordedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {metric.metricType === "blood_pressure"
                            ? `${metric.systolicValue}/${metric.diastolicValue}`
                            : metric.value}{" "}
                          {metric.unit}
                        </p>
                        <Badge variant="default" className="text-xs">
                          Normal
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
