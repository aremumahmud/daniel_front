import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const recordsData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Number of Records",
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: (context) => {
        const chart = context.chart
        const { ctx, chartArea } = chart
        if (!chartArea) {
          return
        }
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
        gradient.addColorStop(0, "rgba(75, 192, 192, 0.2)")
        gradient.addColorStop(1, "rgba(75, 192, 192, 0.8)")
        return gradient
      },
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
      borderRadius: 5,
    },
  ],
}

const activityData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Software Activity",
      data: [12, 19, 3, 5, 2, 3, 9],
      borderColor: (context) => {
        const chart = context.chart
        const { ctx, chartArea } = chart
        if (!chartArea) {
          return
        }
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
        gradient.addColorStop(0, "rgba(255, 99, 132, 0.2)")
        gradient.addColorStop(1, "rgba(255, 99, 132, 1)")
        return gradient
      },
      backgroundColor: (context) => {
        const chart = context.chart
        const { ctx, chartArea } = chart
        if (!chartArea) {
          return
        }
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
        gradient.addColorStop(0, "rgba(255, 99, 132, 0.1)")
        gradient.addColorStop(1, "rgba(255, 99, 132, 0.4)")
        return gradient
      },
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "rgba(255, 99, 132, 1)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    },
  ],
}

export function Overview() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Records Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar
            data={recordsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                  labels: {
                    font: {
                      size: 14,
                      weight: "bold",
                    },
                    color: "rgba(75, 192, 192, 1)",
                  },
                },
                title: {
                  display: true,
                  text: "Monthly Records",
                  font: {
                    size: 18,
                    weight: "bold",
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(75, 192, 192, 0.1)",
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Software Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={activityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                  labels: {
                    font: {
                      size: 14,
                      weight: "bold",
                    },
                    color: "rgba(255, 99, 132, 1)",
                  },
                },
                title: {
                  display: true,
                  text: "Weekly Activity",
                  font: {
                    size: 18,
                    weight: "bold",
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(255, 99, 132, 0.1)",
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
