"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

export default function DoctorSignup() {
  const { register, loading } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: ""
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const registeredUser = await register({ ...form, role: "doctor" })

      // Redirect based on the actual user role from the response
      if (registeredUser.role === "admin") {
        router.push("/dashboard")
      } else if (registeredUser.role === "doctor") {
        router.push("/doctor/dashboard")
      } else {
        router.push("/patient/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Registration failed")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Doctor Signup</h2>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required disabled={loading} />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
          {loading ? "Signing up..." : "Sign up as Doctor"}
        </Button>
      </form>
    </div>
  )
} 