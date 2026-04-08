"use client"

import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <div className="flex min-h-screen">

      {/* Sidebar */}

      <div className="w-64 bg-black text-white p-6">

        <h2 className="text-2xl font-bold mb-8">
          Admin Panel
        </h2>

        <nav className="space-y-4">

          <Link
            href="/admin"
            className="block hover:text-gray-400"
          >
            Dashboard
          </Link>

          <Link
            href="/admin"
            className="block hover:text-gray-400"
          >
            Products
          </Link>

          <Link
            href="/admin/orders"
            className="block hover:text-gray-400"
          >
            Orders
          </Link>

        </nav>

      </div>

      {/* Page Content */}

      <div className="flex-1 p-8 bg-gray-100 text-black">

        {children}

      </div>

    </div>

  )
}