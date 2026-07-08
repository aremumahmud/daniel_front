"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

// The signed-in user's Cognito group decides where they land — there is no
// role picker here on purpose (the old Admin/Doctor/Patient carousel let
// users "choose" a role the token would just override anyway).
const ROLE_REDIRECTS: Record<string, string> = {
  receptionist: "/reception",
  doctor: "/doctor/queue",
  pharmacist: "/pharmacy",
  student: "/student/dashboard",
}

export function AuthPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Enter your email and password to sign in.",
        variant: "destructive",
      })
      return
    }

    try {
      const user = await login(email, password)
      router.push(ROLE_REDIRECTS[user.role] ?? "/auth")
    } catch {
      // useAuth already surfaces the error toast.
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.18),transparent_55%)]"
        />
        <div className="relative flex items-center gap-3">
          <Image
            src="/download.jpeg"
            alt="University of Ilorin"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">UniIlorin Clinic</p>
            <p className="text-xs text-zinc-400">Healthcare Data Management</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative max-w-md space-y-4"
        >
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            One record. Every visit.
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400">
            Registration, consultations, prescriptions and pharmacy fulfilment for the University of
            Ilorin clinic — in one secure place.
          </p>
        </motion.div>

        <p className="relative text-xs text-zinc-500">University of Ilorin &middot; Patient Health Service</p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute right-4 top-4">
          <DarkModeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Image
              src="/download.jpeg"
              alt="University of Ilorin"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <p className="font-semibold tracking-tight">UniIlorin Clinic</p>
          </div>

          <Card className="rounded-lg border shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl tracking-tight">Sign in</CardTitle>
              <CardDescription>
                Use your clinic account. You&apos;ll be taken to your portal automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@unilorin.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Accounts are provisioned by the clinic. Contact the front desk if you can&apos;t sign in.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
