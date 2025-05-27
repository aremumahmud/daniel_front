"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Line, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const userStats = {
  patients: 1250,
  doctors: 75,
  admins: 10,
}

const monthlyUsage = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "System Usage",
      data: [1000, 1200, 1500, 1800, 2000, 2200],
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
      fill: false,
    },
  ],
}

const userDistribution = {
  labels: ["Patients", "Doctors", "Admins"],
  datasets: [
    {
      data: [userStats.patients, userStats.doctors, userStats.admins],
      backgroundColor: ["rgba(255, 99, 132, 0.8)", "rgba(54, 162, 235, 0.8)", "rgba(255, 206, 86, 0.8)"],
    },
  ],
}

const recordsPerMonth = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Records Created",
      data: [500, 600, 750, 800, 900, 1000],
      backgroundColor: "rgba(75, 192, 192, 0.6)",
    },
  ],
}

export function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{userStats.patients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{userStats.doctors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{userStats.admins}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly System Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={monthlyUsage} options={{ responsive: true }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut data={userDistribution} options={{ responsive: true }} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Records Created per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={recordsPerMonth} options={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
