import { Overview } from "@/components/overview"
import { PatientSearch } from "@/components/patient-search"
import { PatientTiles } from "@/components/patient-tiles"

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
      <Overview />
      <div className="glassmorphism p-6 rounded-xl">
        <PatientSearch />
      </div>
      <div className="claymorphism p-6">
        <PatientTiles />
      </div>
    </div>
  )
}
