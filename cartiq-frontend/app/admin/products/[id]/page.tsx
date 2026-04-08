"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditProductPage() {

  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    countInStock: 0,
    image: ""
  })

  const [uploading, setUploading] = useState(false)

  useEffect(() => {

    const fetchProduct = async () => {

      const res = await fetch(`http://localhost:5000/api/products/${id}`)
      const data = await res.json()

      setProduct(data)

    }

    if (id) fetchProduct()

  }, [id])

  const handleChange = (e: any) => {

    setProduct({
      ...product,
      [e.target.name]: e.target.value
    })

  }

  const uploadImage = async (e: any) => {

    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("image", file)

    setUploading(true)

    try {

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      const imageUrl = data.imageUrl

      setProduct(prev => ({
        ...prev,
        image: imageUrl
      }))

    } catch (error) {

      console.error("Upload failed:", error)

    }

    setUploading(false)

  }

  const updateProduct = async (e: any) => {

    e.preventDefault()

    await fetch(`http://localhost:5000/api/products/${id}`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(product)

    })

    alert("Product Updated")

    router.push("/admin")

  }

  return (

    <div className="p-10 max-w-xl">

      <h1 className="text-3xl font-bold mb-8">
        Edit Product
      </h1>

      <form onSubmit={updateProduct} className="space-y-4">

        <input
          name="name"
          value={product.name}
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <input
          name="category"
          value={product.category}
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <input
          name="price"
          type="number"
          value={product.price}
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <input
          name="countInStock"
          type="number"
          value={product.countInStock}
          onChange={handleChange}
          className="border p-3 w-full"
        />

        {/* Current Image */}

        {product.image && (
          <img
            src={product.image}
            alt="product"
            className="w-32 rounded"
          />
        )}

        {/* Upload new image */}

        <input
          type="file"
          onChange={uploadImage}
          className="border p-3 w-full"
        />

        {uploading && (
          <p>Uploading image...</p>
        )}

        <button
          type="submit"
          className="bg-black text-white px-6 py-3"
        >
          Update Product
        </button>

      </form>

    </div>

  )
}