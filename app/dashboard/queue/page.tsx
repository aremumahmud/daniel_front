"use client"

import { QueueManagement } from "@/components/queue-management"
import { AdminGuard } from "@/components/auth-guard"

export default function QueuePage() {
  return (
    <AdminGuard>
      <div className="container mx-auto p-6">
        <QueueManagement />
      </div>
    </AdminGuard>
  )
}
