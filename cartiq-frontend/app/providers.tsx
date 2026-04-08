"use client"

import { AuthProvider } from "@/context/AuthContext"
import { AppProvider } from "@/context/AppContext"
import { CartProvider } from "@/context/CartContext"
import { Toaster } from "react-hot-toast"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <AppProvider>
          {children}
          <Toaster position="top-right" />
        </AppProvider>
      </CartProvider>
    </AuthProvider>
  )
}