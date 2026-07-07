"use client"

import type React from "react"
import { useState } from "react"
import {
  Clock,
  ListOrdered,
  Loader2,
  Search,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AppShell } from "@/components/shell/app-shell"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { StatCard } from "@/components/shell/stat-card"
import { StatusBadge } from "@/components/shell/status-badge"
import { TableSkeleton } from "@/components/shell/table-skeleton"

import { useAuthGuard } from "@/hooks/use-auth-guard"
import { usePolling } from "@/hooks/use-polling"
import { useToast } from "@/hooks/use-toast"
import {
  addToQueue,
  assignDoctorToQueueEntry,
  getQueue,
  listDoctorCapacity,
  registerPatient,
  searchPatients,
} from "@/services/clinic.service"
import type { Patient } from "@/lib/types/clinic"

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

export default function ReceptionPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "receptionist" })
  const { toast } = useToast()

  const [form, setForm] = useState({ matricNumber: "", name: "", email: "", department: "" })
  const [registering, setRegistering] = useState(false)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Patient[] | null>(null)
  const [searching, setSearching] = useState(false)

  const { data: queue, loading: queueLoading, refetch: refetchQueue } = usePolling(
    () => getQueue({ status: "WAITING" }),
    15000,
  )
  const { data: doctors, loading: doctorsLoading } = usePolling(listDoctorCapacity, 15000)

  if (isLoading) return null

  const onlineDoctors = (doctors ?? []).filter((d) => d.status !== "OFFLINE")
  const waiting = queue ?? []

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistering(true)
    try {
      await registerPatient(form)
      toast({ title: "Student registered", description: `${form.name} (${form.matricNumber}) added.` })
      setForm({ matricNumber: "", name: "", email: "", department: "" })
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not register student.",
        variant: "destructive",
      })
    } finally {
      setRegistering(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      setResults(await searchPatients(query.trim()))
    } catch {
      toast({ title: "Search failed", description: "Please try again.", variant: "destructive" })
    } finally {
      setSearching(false)
    }
  }

  const handleQueue = async (patient: Patient, priority: "NORMAL" | "URGENT" = "NORMAL") => {
    try {
      await addToQueue({ matricNumber: patient.matricNumber, patientName: patient.name, priority })
      toast({ title: "Added to queue", description: `${patient.name} is now waiting.` })
      await refetchQueue()
    } catch {
      toast({ title: "Could not queue patient", description: "Please try again.", variant: "destructive" })
    }
  }

  const handleAssign = async (queueId: string, doctorId: string, doctorName: string) => {
    try {
      await assignDoctorToQueueEntry(queueId, { doctorId, doctorName })
      toast({ title: "Doctor assigned", description: `Assigned to ${doctorName}.` })
      await refetchQueue()
    } catch {
      toast({ title: "Assignment failed", description: "Please try again.", variant: "destructive" })
    }
  }

  return (
    <AppShell title="Reception">
      <div className="space-y-8">
        <PageHeader
          title="Reception"
          description="Register students, find records and manage today's waiting queue."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Waiting" value={waiting.length} hint="patients in queue" icon={Clock} loading={queueLoading} />
          <StatCard
            label="Doctors online"
            value={onlineDoctors.length}
            hint={`of ${(doctors ?? []).length} registered`}
            icon={Stethoscope}
            loading={doctorsLoading}
          />
          <StatCard
            label="Unassigned"
            value={waiting.filter((q) => !q.assignedDoctorId).length}
            hint="waiting without a doctor"
            icon={Users}
            loading={queueLoading}
          />
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="find">Find student</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* ---- Queue ---- */}
          <TabsContent value="queue" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-lg shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Waiting queue</CardTitle>
                  <CardDescription>Updates automatically every 15 seconds.</CardDescription>
                </CardHeader>
                <CardContent>
                  {queueLoading ? (
                    <TableSkeleton rows={4} cols={5} />
                  ) : waiting.length === 0 ? (
                    <EmptyState
                      icon={ListOrdered}
                      title="No one is waiting"
                      description="Students you add from Find student will appear here."
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead className="hidden sm:table-cell">Queued</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead className="w-0" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {waiting.map((q) => (
                          <TableRow key={q.queueId}>
                            <TableCell>
                              <p className="font-medium">{q.patientName}</p>
                              <p className="text-xs text-muted-foreground">{q.matricNumber}</p>
                            </TableCell>
                            <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                              {timeAgo(q.createdAt)}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={q.priority} />
                            </TableCell>
                            <TableCell className="text-sm">
                              {q.assignedDoctorName || <span className="text-muted-foreground">Unassigned</span>}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Assign
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
                                  <DropdownMenuLabel>Available doctors</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {onlineDoctors.length === 0 ? (
                                    <DropdownMenuItem disabled>No doctors online</DropdownMenuItem>
                                  ) : (
                                    onlineDoctors.map((d) => (
                                      <DropdownMenuItem
                                        key={d.doctorId}
                                        onClick={() => handleAssign(q.queueId, d.doctorId, d.doctorName)}
                                      >
                                        <span className="flex-1 truncate">{d.doctorName}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {d.currentLoad}/{d.maxCapacity}
                                        </span>
                                      </DropdownMenuItem>
                                    ))
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Doctor availability</CardTitle>
                  <CardDescription>Live status and load.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doctorsLoading ? (
                    <TableSkeleton rows={3} cols={2} />
                  ) : (doctors ?? []).length === 0 ? (
                    <EmptyState
                      icon={Stethoscope}
                      title="No doctors yet"
                      description="Doctors appear here once they go online."
                    />
                  ) : (
                    (doctors ?? []).map((d) => (
                      <div key={d.doctorId} className="flex items-center justify-between gap-2 rounded-md border p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{d.doctorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {d.currentLoad} of {d.maxCapacity} patients
                          </p>
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ---- Find student ---- */}
          <TabsContent value="find">
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Find a student</CardTitle>
                <CardDescription>Search by name or matriculation number, then add them to the queue.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Fatima or 21/52HL001"
                      className="pl-9"
                      aria-label="Search students"
                    />
                  </div>
                  <Button type="submit" disabled={searching || !query.trim()}>
                    {searching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Search
                  </Button>
                </form>

                {results === null ? null : results.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No matches"
                    description="Check the spelling, or register the student if they're new."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Department</TableHead>
                        <TableHead className="w-0" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((p) => (
                        <TableRow key={p.matricNumber}>
                          <TableCell>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.matricNumber}</p>
                          </TableCell>
                          <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                            {p.department}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleQueue(p, "URGENT")}>
                                Urgent
                              </Button>
                              <Button size="sm" onClick={() => handleQueue(p)}>
                                Add to queue
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Register ---- */}
          <TabsContent value="register">
            <Card className="max-w-2xl rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Register a new student</CardTitle>
                <CardDescription>Creates the student&apos;s clinic record. All fields are required.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="matric">Matriculation number</Label>
                    <Input
                      id="matric"
                      placeholder="21/52HL001"
                      value={form.matricNumber}
                      onChange={(e) => setForm({ ...form, matricNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="Fatima Yusuf"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="fatima@unilorin.edu.ng"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      placeholder="Medicine"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={registering}>
                      {registering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                      Register student
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
