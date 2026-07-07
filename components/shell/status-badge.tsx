import { cn } from "@/lib/utils"

// One tinted-pill treatment for every status in the system so queue,
// prescription, doctor-availability and appointment states all read the
// same way across portals.
const STATUS_STYLES: Record<string, string> = {
  // queue
  WAITING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  // prescriptions
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  COLLECTED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  // doctor capacity
  ONLINE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  OFFLINE: "bg-muted text-muted-foreground border-border",
  AT_CAPACITY: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  // appointments
  SCHEDULED: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
  // priority
  URGENT: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  NORMAL: "bg-muted text-muted-foreground border-border",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  )
}
