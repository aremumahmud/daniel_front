"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useToast } from "@/hooks/use-toast"
import { usePolling } from "@/hooks/use-polling"
import {
  registerPatient,
  searchPatients,
  addToQueue,
  getQueue,
  listDoctorCapacity,
  assignDoctorToQueueEntry,
} from "@/services/clinic.service"
import type { Patient } from "@/lib/types/clinic"

// Receptionist Portal — FR-1 (register), FR-2 (search), FR-4/FR-5 (queue +
// assignment). Renamed/scoped down from the old app/dashboard/* admin
// screens per the migration plan — see MIGRATION_NOTES.md.
export default function ReceptionPage() {
  const { isLoading } = useAuthGuard({ requiredRole: "receptionist" })
  const { toast } = useToast()

  const [form, setForm] = useState({ matricNumber: "", name: "", email: "", department: "" })
  const [registering, setRegistering] = useState(false)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Patient[]>([])
  const [searching, setSearching] = useState(false)

  const { data: queue, refetch: refetchQueue } = usePolling(() => getQueue({ status: "WAITING" }), 15000)
  const { data: doctors } = usePolling(listDoctorCapacity, 15000)

  if (isLoading) return null

  const handleRegister = async () => {
    setRegistering(true)
    try {
      await registerPatient(form)
      toast({ title: "Student Registered", description: `${form.name} (${form.matricNumber}) added.` })
      setForm({ matricNumber: "", name: "", email: "", department: "" })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Could not register student",
        variant: "destructive",
      })
    } finally {
      setRegistering(false)
    }
  }

  const handleSearch = async () => {
    setSearching(true)
    try {
      setResults(await searchPatients(query))
    } finally {
      setSearching(false)
    }
  }

  const handleQueue = async (patient: Patient) => {
    try {
      await addToQueue({ matricNumber: patient.matricNumber, patientName: patient.name })
      toast({ title: "Added to Queue", description: `${patient.name} is now waiting.` })
      await refetchQueue()
    } catch (error) {
      toast({ title: "Failed to Queue", description: "Please try again.", variant: "destructive" })
    }
  }

  const handleAssign = async (queueId: string, doctorId: string, doctorName: string) => {
    try {
      await assignDoctorToQueueEntry(queueId, { doctorId, doctorName })
      toast({ title: "Doctor Assigned" })
      await refetchQueue()
    } catch (error) {
      toast({ title: "Assignment Failed", variant: "destructive" })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">Receptionist Portal</h1>

      <Card>
        <CardHeader>
          <CardTitle>Register New Student</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>Matriculation Number</Label>
            <Input value={form.matricNumber} onChange={(e) => setForm({ ...form, matricNumber: e.target.value })} placeholder="21/52HL001" />
          </div>
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Department</Label>
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Button onClick={handleRegister} disabled={registering || !form.matricNumber || !form.name}>
              Register Student
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or matric number" />
            <Button onClick={handleSearch} disabled={searching}>Search</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Matric No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((p) => (
                <TableRow key={p.matricNumber}>
                  <TableCell>{p.matricNumber}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.department}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => handleQueue(p)}>Add to Queue</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Waiting Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Matric No.</TableCell>
                <TableCell>Assigned Doctor</TableCell>
                <TableCell>Assign</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(queue ?? []).map((q) => (
                <TableRow key={q.queueId}>
                  <TableCell>{q.patientName}</TableCell>
                  <TableCell>{q.matricNumber}</TableCell>
                  <TableCell>{q.assignedDoctorName ?? <Badge variant="outline">Unassigned</Badge>}</TableCell>
                  <TableCell className="flex gap-1 flex-wrap">
                    {(doctors ?? []).filter((d) => d.status !== "OFFLINE").map((d) => (
                      <Button key={d.doctorId} size="sm" variant="outline" onClick={() => handleAssign(q.queueId, d.doctorId, d.doctorName)}>
                        {d.doctorName}
                      </Button>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Availability</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(doctors ?? []).map((d) => (
            <Badge key={d.doctorId} variant={d.status === "ONLINE" ? "default" : "secondary"}>
              {d.doctorName} — {d.status} ({d.currentLoad}/{d.maxCapacity})
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
