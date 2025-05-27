"use client"

import { useState } from "react"
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const healthMetrics = [
  {
    id: 1,
    type: "Blood Pressure",
    icon: Heart,
    currentValue: "120/80",
    unit: "mmHg",
    status: "Normal",
    trend: "stable",
    lastUpdated: "2024-01-20",
    target: "< 130/80",
    data: [
      { date: "Jan 1", systolic: 125, diastolic: 82 },
      { date: "Jan 5", systolic: 122, diastolic: 79 },
      { date: "Jan 10", systolic: 118, diastolic: 76 },
      { date: "Jan 15", systolic: 120, diastolic: 80 },
      { date: "Jan 20", systolic: 120, diastolic: 80 },
    ],
  },
  {
    id: 2,
    type: "Heart Rate",
    icon: Activity,
    currentValue: "72",
    unit: "bpm",
    status: "Normal",
    trend: "stable",
    lastUpdated: "2024-01-20",
    target: "60-100",
    data: [
      { date: "Jan 1", value: 75 },
      { date: "Jan 5", value: 73 },
      { date: "Jan 10", value: 70 },
      { date: "Jan 15", value: 74 },
      { date: "Jan 20", value: 72 },
    ],
  },
  {
    id: 3,
    type: "Weight",
    icon: Weight,
    currentValue: "165",
    unit: "lbs",
    status: "Normal",
    trend: "down",
    lastUpdated: "2024-01-20",
    target: "160-170",
    data: [
      { date: "Jan 1", value: 168 },
      { date: "Jan 5", value: 167 },
      { date: "Jan 10", value: 166 },
      { date: "Jan 15", value: 165 },
      { date: "Jan 20", value: 165 },
    ],
  },
  {
    id: 4,
    type: "Blood Glucose",
    icon: Activity,
    currentValue: "95",
    unit: "mg/dL",
    status: "Normal",
    trend: "stable",
    lastUpdated: "2024-01-19",
    target: "70-100",
    data: [
      { date: "Jan 1", value: 98 },
      { date: "Jan 5", value: 92 },
      { date: "Jan 10", value: 96 },
      { date: "Jan 15", value: 94 },
      { date: "Jan 19", value: 95 },
    ],
  },
]

export function PatientHealthMetrics() {
  const [selectedMetric, setSelectedMetric] = useState<(typeof healthMetrics)[0] | null>(null)
  const [newReading, setNewReading] = useState({
    type: "",
    value: "",
    systolic: "",
    diastolic: "",
    date: new Date().toISOString().split("T")[0],
  })

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

  const handleAddReading = () => {
    // In a real app, this would save the new reading
    console.log("Adding new reading:", newReading)
    setNewReading({
      type: "",
      value: "",
      systolic: "",
      diastolic: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

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
                  value={newReading.type}
                  onValueChange={(value) => setNewReading({ ...newReading, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select metric type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood-pressure">Blood Pressure</SelectItem>
                    <SelectItem value="heart-rate">Heart Rate</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="blood-glucose">Blood Glucose</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newReading.type === "blood-pressure" ? (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="systolic" className="text-right">
                      Systolic
                    </Label>
                    <Input
                      id="systolic"
                      value={newReading.systolic}
                      onChange={(e) => setNewReading({ ...newReading, systolic: e.target.value })}
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
                      value={newReading.diastolic}
                      onChange={(e) => setNewReading({ ...newReading, diastolic: e.target.value })}
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
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newReading.date}
                  onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
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

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedMetric(metric)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.type}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.currentValue} {metric.unit}
              </div>
              <div className="flex items-center justify-between mt-2">
                <Badge variant={getStatusColor(metric.status)}>{metric.status}</Badge>
                {getTrendIcon(metric.trend)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Target: {metric.target}</p>
              <p className="text-xs text-muted-foreground">Last updated: {metric.lastUpdated}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Chart View */}
      {selectedMetric && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedMetric.type} Trends</CardTitle>
            <CardDescription>Your {selectedMetric.type.toLowerCase()} readings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric.type === "Blood Pressure" ? (
                  <LineChart data={selectedMetric.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="systolic" stroke="#8884d8" strokeWidth={2} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" strokeWidth={2} name="Diastolic" />
                  </LineChart>
                ) : (
                  <LineChart data={selectedMetric.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Readings</CardTitle>
          <CardDescription>Your latest health metric entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <metric.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{metric.type}</p>
                    <p className="text-sm text-muted-foreground">{metric.lastUpdated}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {metric.currentValue} {metric.unit}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(metric.status)} className="text-xs">
                      {metric.status}
                    </Badge>
                    {getTrendIcon(metric.trend)}
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
