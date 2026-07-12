"use client"

import { ClipboardList } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/shell/empty-state"
import { TableSkeleton } from "@/components/shell/table-skeleton"
import type { AuditLogEntry } from "@/lib/types/clinic"

// Renders an audit trail. The backend (getAuditLog) already scopes entries to
// the caller's role, so every portal can share this component and only ever
// sees its own slice.
export function AuditTable({
  entries,
  loading,
  showActor = true,
}: {
  entries: AuditLogEntry[] | null
  loading?: boolean
  showActor?: boolean
}) {
  if (loading) return <TableSkeleton rows={5} cols={showActor ? 4 : 3} />
  if (!entries || entries.length === 0) {
    return <EmptyState icon={ClipboardList} title="No activity yet" />
  }

  const sorted = entries.slice().sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Action</TableHead>
          {showActor && <TableHead className="hidden sm:table-cell">By</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((a) => (
          <TableRow key={a.logId}>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
              {new Date(a.timestamp).toLocaleString()}
            </TableCell>
            <TableCell className="text-sm">{a.matricNumber}</TableCell>
            <TableCell>
              <span className="text-sm font-medium">{a.action.replaceAll("_", " ").toLowerCase()}</span>
            </TableCell>
            {showActor && (
              <TableCell className="hidden text-sm capitalize text-muted-foreground sm:table-cell">
                {a.performedByRole}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
