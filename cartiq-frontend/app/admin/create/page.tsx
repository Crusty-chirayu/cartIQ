"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateProductPage() {

  const router = useRouter()

  const [product, setProduct] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    countInStock: 0,
    image: ""
  })

  const [uploading, setUploading] = useState(false)

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

      console.log("Upload response:", data)

      const imageUrl =
        data.url ||
        data.image ||
        data.imageUrl ||
        data.secure_url

      if (!imageUrl) {
        alert("Image upload failed")
        return
      }

      setProduct(prev => ({
        ...prev,
        image: imageUrl
      }))

    } catch (error) {

      console.error("Upload error:", error)
      alert("Upload failed")

    }

    setUploading(false)

  }

  const createProduct = async (e: any) => {

    e.preventDefault()

    if (!product.image) {
      alert("Please upload an image first")
      return
    }

    await fetch("http://localhost:5000/api/products", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(product)

    })

    alert("Product Created")

    router.push("/admin")

  }

  return (

    <div className="p-10 max-w-xl">

      <h1 className="text-3xl font-bold mb-8">
        Add Product
      </h1>

      <form onSubmit={createProduct} className="space-y-4">

        <input
          name="name"
          placeholder="Product Name"
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <input
          name="category"
          placeholder="Category"
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <input
          name="price"
          type="number"
          placeholder="Price"
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <input
          name="countInStock"
          type="number"
          placeholder="Stock"
          onChange={handleChange}
          className="border p-3 w-full"
        />

        <div>

          <input
            type="file"
            onChange={uploadImage}
            className="border p-3 w-full"
          />

          {uploading && (
            <p className="text-sm mt-2">Uploading image...</p>
          )}

          {product.image && (
            <img
              src={product.image}
              alt="preview"
              className="mt-3 w-32 rounded"
            />
          )}

        </div>

        <button
          type="submit"
          className="bg-black text-white px-6 py-3"
        >
          Create Product
        </button>

      </form>

    </div>

  )
}