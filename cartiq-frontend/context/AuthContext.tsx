"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface User {
  _id: string
  name: string
  email: string
  role: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (data: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: any) => {

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {

    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

  }, [])

  const login = (data: User) => {

    localStorage.setItem("user", JSON.stringify(data))
    setUser(data)

  }

  const logout = () => {

    localStorage.removeItem("user")
    setUser(null)

  }

  return (

    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>

  )

}

export const useAuth = () => {

  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context

}