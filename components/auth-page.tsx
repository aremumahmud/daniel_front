"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { AuthForm } from "@/components/auth-form"
import { Logo } from "@/components/logo"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const userTypes = ["Admin", "Doctor", "Patient"]

export function AuthPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeUserType = userTypes[activeIndex]

  const nextUserType = () => {
    setActiveIndex((prev) => (prev === userTypes.length - 1 ? 0 : prev + 1))
  }

  const prevUserType = () => {
    setActiveIndex((prev) => (prev === 0 ? userTypes.length - 1 : prev - 1))
  }

  const getBackgroundImage = (userType: string) => {
    switch (userType) {
      case "Admin":
        return "/placeholder.svg?height=600&width=800&text=Admin+Dashboard"
      case "Doctor":
        return "/placeholder.svg?height=600&width=800&text=Doctor+Portal"
      case "Patient":
        return "/placeholder.svg?height=600&width=800&text=Patient+Records"
      default:
        return "/placeholder.svg?height=600&width=800"
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="relative flex w-full items-center justify-center bg-background p-8 md:w-1/2">
        <div className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center space-x-4">
          <Logo />
          <DarkModeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={prevUserType}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              aria-label="Previous user type"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">{activeUserType} Login</h2>
              <p className="text-sm text-muted-foreground">Sign in to your account</p>
            </div>
            <button
              onClick={nextUserType}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              aria-label="Next user type"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="relative h-[450px] overflow-hidden">
            {userTypes.map((userType, index) => (
              <motion.div
                key={userType}
                className="absolute w-full"
                initial={{ opacity: 0, x: index > activeIndex ? 100 : -100 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  x: index === activeIndex ? 0 : index > activeIndex ? 100 : -100,
                  zIndex: index === activeIndex ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {index === activeIndex && <AuthForm userType={userType} />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative hidden w-1/2 md:block">
        <motion.div
          key={activeUserType}
          className="absolute inset-0 bg-cover bg-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ backgroundImage: `url(${getBackgroundImage(activeUserType)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
        </motion.div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            key={`content-${activeUserType}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md text-center"
          >
            <h1 className="mb-6 text-4xl font-bold">
              {activeUserType === "Admin" && "Manage Your Health System"}
              {activeUserType === "Doctor" && "Provide Better Care"}
              {activeUserType === "Patient" && "Take Control of Your Health"}
            </h1>
            <p className="text-xl">
              {activeUserType === "Admin" &&
                "Access administrative tools to manage your healthcare organization efficiently."}
              {activeUserType === "Doctor" &&
                "Access patient records, schedule appointments, and provide the best care possible."}
              {activeUserType === "Patient" &&
                "View your medical history, upcoming appointments, and communicate with your healthcare providers."}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
