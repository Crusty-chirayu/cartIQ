"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  price: number
  countInStock: number
}

export default function AdminProductsPage() {

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {

    try {

      const res = await fetch("http://localhost:5000/api/products")

      const data = await res.json()

      setProducts(data)

    } catch (error) {

      console.log("Error fetching products:", error)

    }

    setLoading(false)
  }

  useEffect(() => {

    fetchProducts()

  }, [])

  const deleteProduct = async (id: string) => {

    const confirmDelete = confirm("Delete this product?")

    if (!confirmDelete) return

    try {

      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE"
      })

      fetchProducts()

    } catch (error) {

      console.log("Delete error:", error)

    }
  }

  if (loading) {

    return (
      <div className="p-10">
        <p>Loading products...</p>
      </div>
    )

  }

  return (

    <div className="space-y-8">

      {/* DASHBOARD STATS */}

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Total Products</p>
          <h2 className="text-2xl font-bold">
            {products.length}
          </h2>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Orders</p>
          <h2 className="text-2xl font-bold">
            0
          </h2>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Revenue</p>
          <h2 className="text-2xl font-bold">
            ₹0
          </h2>
        </div>

      </div>

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Product Manager
        </h1>

        <Link
          href="/admin/create"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Product
        </Link>

      </div>

      {/* PRODUCT TABLE */}

      <table className="w-full border bg-white">

        <thead>

          <tr className="bg-gray-200">

            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Stock</th>
            <th className="p-3 text-left">Actions</th>

          </tr>

        </thead>

        <tbody>

          {products.map((product) => (

            <tr key={product._id} className="border-t">

              <td className="p-3">
                {product.name}
              </td>

              <td className="p-3">
                ₹{product.price}
              </td>

              <td className="p-3">
                {product.countInStock}
              </td>

              <td className="p-3 space-x-4">

                <Link href={`/admin/products/${product._id}`}>
                  <button className="text-blue-600">
                    Edit
                  </button>
                </Link>

                <button
                  onClick={() => deleteProduct(product._id)}
                  className="text-red-600"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}