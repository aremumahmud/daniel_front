"use client"

import { useState } from "react"
import { SideNav } from "@/components/side-nav"
import { Overview } from "@/components/overview"
import { PatientSearch } from "@/components/patient-search"
import { PatientTiles } from "@/components/patient-tiles"
import { PatientsPage } from "@/components/patients-page"
import { AnalyticsPage } from "@/components/analytics-page"
import { DoctorsPage } from "@/components/doctors-page"
import { motion } from "framer-motion"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex h-screen bg-background">
      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === "overview" && (
            <>
              <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <Overview />
              <div className="glassmorphism p-6 rounded-xl">
                <PatientSearch />
              </div>
              <div className="claymorphism p-6">
                <PatientTiles />
              </div>
            </>
          )}
          {activeTab === "patients" && <PatientsPage />}
          {activeTab === "analytics" && <AnalyticsPage />}
          {activeTab === "doctors" && <DoctorsPage />}
          {activeTab === "settings" && <h1 className="text-4xl font-bold text-foreground">Settings</h1>}
        </motion.div>
      </main>
    </div>
  )
}
