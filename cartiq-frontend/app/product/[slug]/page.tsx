"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { productsApi } from "@/lib/api"

interface Product {
  _id: string
  slug: string
  title: string
  description: string
  price: number
  images: Array<{ url: string; alt: string; isPrimary: boolean }>
  stock: number
  ratings: { average: number; count: number }
  seller: { name: string; avatar: string }
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await productsApi.getBySlug(slug)
        setProduct(response.data?.data || response.data)
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load product")
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cartiq-accent"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error || "Product not found"}</p>
        </div>
        <button
          onClick={() => router.push("/shop")}
          className="bg-cartiq-dark text-white px-6 py-2 rounded-lg hover:bg-cartiq-dark-secondary transition-colors"
        >
          Back to Shop
        </button>
      </div>
    )
  }

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url
  const rating = product.ratings?.average || 0
  const reviewCount = product.ratings?.count || 0

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-cartiq-accent hover:text-cartiq-accent-secondary transition-colors flex items-center gap-2"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="flex flex-col gap-4">
          <div className="bg-cartiq-bg-secondary rounded-lg overflow-hidden h-96 flex items-center justify-center">
            <img
              src={primaryImage || "/assets/images/no_image.png"}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnail gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="w-20 h-20 bg-cartiq-bg-secondary rounded cursor-pointer hover:border-2 hover:border-cartiq-accent">
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-cartiq-foreground mb-2">{product.title}</h1>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-lg ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-cartiq-muted">({reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <p className="text-3xl font-bold text-cartiq-accent mb-2">₹{product.price}</p>

            {/* Stock */}
            <p className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-cartiq-muted leading-relaxed">{product.description}</p>
          </div>

          {/* Seller Info */}
          {product.seller && (
            <div className="bg-cartiq-bg-secondary rounded-lg p-4">
              <p className="text-sm text-cartiq-muted mb-1">Sold by</p>
              <div className="flex items-center gap-2">
                {product.seller.avatar && (
                  <img src={product.seller.avatar} alt={product.seller.name} className="w-8 h-8 rounded-full" />
                )}
                <p className="font-semibold">{product.seller.name}</p>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <button
            disabled={product.stock === 0}
            className="w-full bg-cartiq-dark text-white font-semibold py-3 rounded-lg hover:bg-cartiq-dark-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  )
}