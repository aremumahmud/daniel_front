import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { ThemeProvider } from "@/contexts/ThemeContext"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth.tsx"
import { Toaster } from "@/components/ui/toaster"

// Initialize the DM Sans font
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Dealth - Health Record System",
  description: "Secure health record management system",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
