"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function Navbar() {

  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (

    <nav className="flex justify-between items-center p-4 bg-black text-white">

      {/* LEFT */}
      <Link href="/" className="text-xl font-bold">
        CartIQ
      </Link>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {!user ? (

          <>
            <Link href="/login">Login</Link>
          </>

        ) : (

          <>
            <span>{user.name}</span>

            {/* ROLE BASED LINKS */}

            {user.role === "seller" && (
              <Link href="/seller">Seller Dashboard</Link>
            )}

            {user.role === "admin" && (
              <Link href="/admin">Admin</Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-white text-black px-3 py-1"
            >
              Logout
            </button>
          </>

        )}

      </div>

    </nav>

  )

}