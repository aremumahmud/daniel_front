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
  type RegisterPatientInput,
} from "@/services/clinic.service"
import type { Patient } from "@/lib/types/clinic"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

const BLANK_FORM = {
  matricNumber: "",
  name: "",
  email: "",
  department: "",
  dateOfBirth: "",
  sex: "",
  bloodGroup: "",
  genotype: "",
  height: "",
  weight: "",
  allergies: "",
  chronicConditions: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  stateOfOrigin: "",
  nationality: "",
}

export default function ReceptionPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "receptionist" })
  const { toast } = useToast()

  const [form, setForm] = useState({ ...BLANK_FORM })
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
      // Send only filled fields; convert height/weight to numbers.
      const payload: RegisterPatientInput = {
        matricNumber: form.matricNumber,
        name: form.name,
        email: form.email,
        department: form.department,
      }
      const optionalStr = [
        "dateOfBirth", "sex", "bloodGroup", "genotype", "allergies",
        "chronicConditions", "emergencyContactName", "emergencyContactPhone",
        "stateOfOrigin", "nationality",
      ] as const
      for (const k of optionalStr) {
        if (form[k]?.trim()) (payload as Record<string, unknown>)[k] = form[k].trim()
      }
      if (form.height?.trim()) payload.height = Number(form.height)
      if (form.weight?.trim()) payload.weight = Number(form.weight)

      await registerPatient(payload)
      toast({ title: "Patient registered", description: `${form.name} (${form.matricNumber}) added.` })
      setForm({ ...BLANK_FORM })
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not register patient.",
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
          description="Register patients, find records and manage today's waiting queue."
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
            <TabsTrigger value="find">Find patient</TabsTrigger>
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
                      description="Patients you add from Find patient will appear here."
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
                <CardTitle className="text-base">Find a patient</CardTitle>
                <CardDescription>Search by name or patient ID, then add them to the queue.</CardDescription>
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
                      aria-label="Search patients"
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
                    description="Check the spelling, or register the patient if they're new."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
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
            <Card className="max-w-3xl rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Register a new patient</CardTitle>
                <CardDescription>
                  Creates the patient&apos;s clinic file. Only the identity fields are required; add
                  demographics where known.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-8">
                  {/* Identity */}
                  <div className="space-y-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Identity</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="matric">Patient ID / Matric no. *</Label>
                        <Input id="matric" placeholder="21/52HL001" value={form.matricNumber}
                          onChange={(e) => setForm({ ...form, matricNumber: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full name *</Label>
                        <Input id="name" placeholder="Fatima Yusuf" value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email *</Label>
                        <Input id="reg-email" type="email" placeholder="fatima@unilorin.edu.ng" value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Input id="department" placeholder="Medicine" value={form.department}
                          onChange={(e) => setForm({ ...form, department: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of birth</Label>
                        <Input id="dob" type="date" value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sex">Sex</Label>
                        <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                          <SelectTrigger id="sex"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Clinical */}
                  <div className="space-y-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Clinical</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="blood">Blood group</Label>
                        <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}>
                          <SelectTrigger id="blood"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="genotype">Genotype</Label>
                        <Select value={form.genotype} onValueChange={(v) => setForm({ ...form, genotype: v })}>
                          <SelectTrigger id="genotype"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {["AA", "AS", "SS", "AC", "SC"].map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input id="height" type="number" inputMode="numeric" placeholder="175" value={form.height}
                          onChange={(e) => setForm({ ...form, height: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input id="weight" type="number" inputMode="numeric" placeholder="68" value={form.weight}
                          onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Input id="allergies" placeholder="None" value={form.allergies}
                          onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chronic">Chronic conditions</Label>
                        <Input id="chronic" placeholder="None" value={form.chronicConditions}
                          onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Emergency contact + origin */}
                  <div className="space-y-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Emergency contact &amp; origin
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ecName">Emergency contact name</Label>
                        <Input id="ecName" placeholder="Next of kin" value={form.emergencyContactName}
                          onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ecPhone">Emergency contact phone</Label>
                        <Input id="ecPhone" placeholder="+2348012345678" value={form.emergencyContactPhone}
                          onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State of origin</Label>
                        <Input id="state" placeholder="Kwara" value={form.stateOfOrigin}
                          onChange={(e) => setForm({ ...form, stateOfOrigin: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input id="nationality" placeholder="Nigerian" value={form.nationality}
                          onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={registering}>
                    {registering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Register patient
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
