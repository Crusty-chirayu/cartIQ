"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ProductPage() {

  const { id } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(setProduct)
  }, [id])

  if (!product) return <p className="p-6">Loading...</p>

  return (

    <div className="max-w-4xl mx-auto p-6">

      {/* 🔥 CLOSE BUTTON */}
      <button
        onClick={() => router.push("/ai")}
        className="mb-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Close & Back to AI
      </button>

      <img src={product.image} className="w-full h-80 object-cover rounded" />

      <h1 className="text-2xl font-bold mt-4">{product.name}</h1>

      <p className="text-lg text-gray-600 mt-2">₹{product.price}</p>

    </div>

  )

}