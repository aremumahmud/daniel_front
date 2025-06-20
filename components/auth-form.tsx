"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

interface AuthFormProps {
  userType: string
}

export function AuthForm({ userType }: AuthFormProps) {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const loggedInUser = await login(formData.email, formData.password)

      console.log("Logged in user:", loggedInUser)

      // Redirect based on user role from API response
      if (loggedInUser.role === "admin") {
        router.push("/dashboard")
      } else if (loggedInUser.role === "doctor") {
        router.push("/doctor/dashboard")
      } else {
        router.push("/patient/dashboard")
      }
    } catch (error) {
      // Error is already handled in the useAuth hook
      console.error("Login error:", error)
    }
  }

  const handleGoogleSignIn = () => {
    toast({
      title: "Coming Soon",
      description: "Google Sign-In will be available soon",
    })
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder={`${userType} email`}
            required
            disabled={loading}
            className="h-12"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            disabled={loading}
            className="h-12"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm font-normal">
            Remember me
          </Label>
        </div>
        <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
          {loading ? "Signing in..." : `Sign in as ${userType}`}
        </Button>
      </form>

      <div className="flex items-center">
        <Separator className="flex-1" />
        <span className="mx-2 text-sm text-gray-400">OR</span>
        <Separator className="flex-1" />
      </div>

      <Button variant="outline" className="w-full h-12 text-lg" onClick={handleGoogleSignIn} disabled={loading}>
        <svg
          className="mr-2 h-5 w-5"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          ></path>
        </svg>
        Sign in with Google
      </Button>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <a
          href="#"
          className="font-medium text-primary hover:underline"
          onClick={e => {
            e.preventDefault();
            if (userType.toLowerCase() === "admin") {
              router.push("/dashboard/admin-signup");
            } else if (userType.toLowerCase() === "doctor") {
              router.push("/doctor/signup");
            } else {
              router.push("/auth/signup"); // fallback or patient signup if implemented
            }
          }}
        >
          Sign up
        </a>
      </p>
    </motion.div>
  )
}
