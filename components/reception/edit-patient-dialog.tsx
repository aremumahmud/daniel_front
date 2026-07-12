"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getPatient, updatePatient } from "@/services/clinic.service"
import type { Patient } from "@/lib/types/clinic"

// Edit a patient's clinical/demographic fields. Identity fields (name, ID,
// email, department, DOB) are shown read-only — they aren't editable via the
// updatePatient Lambda.
export function EditPatientDialog({
  matricNumber,
  open,
  onOpenChange,
  onSaved,
}: {
  matricNumber: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const { toast } = useToast()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open || !matricNumber) return
    setLoading(true)
    getPatient(matricNumber)
      .then((p) => {
        setPatient(p)
        setForm({
          sex: p.sex ?? "",
          bloodGroup: p.bloodGroup ?? "",
          genotype: p.genotype ?? "",
          height: p.height != null ? String(p.height) : "",
          weight: p.weight != null ? String(p.weight) : "",
          allergies: p.allergies ?? "",
          chronicConditions: p.chronicConditions ?? "",
          emergencyContactName: p.emergencyContactName ?? "",
          emergencyContactPhone: p.emergencyContactPhone ?? "",
          stateOfOrigin: p.stateOfOrigin ?? "",
          nationality: p.nationality ?? "",
        })
      })
      .catch(() => toast({ title: "Could not load patient", variant: "destructive" }))
      .finally(() => setLoading(false))
  }, [open, matricNumber, toast])

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matricNumber) return
    setSaving(true)
    try {
      await updatePatient({
        matricNumber,
        sex: form.sex || undefined,
        bloodGroup: form.bloodGroup || undefined,
        genotype: form.genotype || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        allergies: form.allergies || undefined,
        chronicConditions: form.chronicConditions || undefined,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
        stateOfOrigin: form.stateOfOrigin || undefined,
        nationality: form.nationality || undefined,
      })
      toast({ title: "Record updated", description: `${patient?.name ?? matricNumber}'s record has been saved.` })
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit patient record</DialogTitle>
          <DialogDescription>
            {patient ? (
              <>
                {patient.name} &middot; {patient.matricNumber} &middot; {patient.department}
              </>
            ) : (
              "Loading…"
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={form.sex} onValueChange={(v) => set("sex", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Blood group</Label>
                <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Genotype</Label>
                <Select value={form.genotype} onValueChange={(v) => set("genotype", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["AA", "AS", "SS", "AC", "SC"].map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e-height">Height (cm)</Label>
                  <Input id="e-height" type="number" value={form.height} onChange={(e) => set("height", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-weight">Weight (kg)</Label>
                  <Input id="e-weight" type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-allergies">Allergies</Label>
                <Input id="e-allergies" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-chronic">Chronic conditions</Label>
                <Input id="e-chronic" value={form.chronicConditions} onChange={(e) => set("chronicConditions", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-ecn">Emergency contact name</Label>
                <Input id="e-ecn" value={form.emergencyContactName} onChange={(e) => set("emergencyContactName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-ecp">Emergency contact phone</Label>
                <Input id="e-ecp" value={form.emergencyContactPhone} onChange={(e) => set("emergencyContactPhone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-state">State of origin</Label>
                <Input id="e-state" value={form.stateOfOrigin} onChange={(e) => set("stateOfOrigin", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-nat">Nationality</Label>
                <Input id="e-nat" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
