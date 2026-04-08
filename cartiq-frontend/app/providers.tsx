"use client"

import { AuthProvider } from "@/context/AuthContext"
import { AppProvider } from "@/context/AppContext"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AppProvider>   {/* 🔥 ADD THIS */}
        {children}
      </AppProvider>
    </AuthProvider>
  )
}