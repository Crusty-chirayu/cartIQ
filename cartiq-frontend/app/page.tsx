"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { useNotification } from "@/hooks/useNotification";
import { Product, Category } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Loader, Badge } from "@/components/ui";
import Footer from "@/components/Footer";
import { div } from "framer-motion/client";

export default function Homepage() {
  const { get, loading } = useApi();
  const { error } = useNotification();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          get("/products?limit=8"),
          get("/categories"),
        ]);
        setFeaturedProducts(productsRes?.data || []);
        setCategories(categoriesRes?.data || []);
        setTrendingProducts((productsRes?.data || []).slice(0, 6));
      } catch (err: any) {
        error("Failed to load homepage data");
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Banner with Animation */}
      <section className="relative h-96 md:h-[500px] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-blue-400 to-pink-400 animate-pulse"></div>
        </div>
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="max-w-2xl animate-fadeInUp">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🛍️ CartIQ - Your AI Shopping Hub
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 drop-shadow">
              Smart recommendations • Fast shipping • Best prices
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🛒 Shop Now
              </Link>
              <Link
                href="/ai"
                className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🤖 Try AI Chat
              </Link>
            </div>
          </div>
          <div className="hidden md:block absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="w-96 h-96 bg-white/20 rounded-full blur-3xl animate-float"></div>
          </div>
        </div>
      </section>

      {/* Promotional Ads Carousel */}
      <section className="py-6 bg-white shadow-md overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 pb-4 overflow-x-auto">
            {[
              { icon: "⚡", text: "Free Shipping on Orders Above ₹500", color: "bg-yellow-100 text-yellow-800" },
              { icon: "🎁", text: "First Time Buyer? Get 20% OFF with WELCOME20", color: "bg-pink-100 text-pink-800" },
              { icon: "🚀", text: "Same Day Delivery Available in Select Areas", color: "bg-blue-100 text-blue-800" },
            ].map((promo, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 ${promo.color} px-6 py-3 rounded-lg font-semibold whitespace-nowrap animate-slideInRight`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {promo.icon} {promo.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 animate-fadeInUp">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">🏪 Browse by Category</h2>
          <p className="text-gray-600 mb-8 text-lg">Find products from your favorite categories</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category, idx) => (
              <Link
                key={category._id}
                href={`/shop?category=${category.slug}`}
              >
                <div className="group relative h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg overflow-hidden cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-center text-white font-semibold text-lg group-hover:scale-110 transition-transform">
                      {category.name}
                    </h3>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <Loader fullScreen={false} />
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Trending Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingProducts.map((product) => (
              <Link key={product._id} href={`/product/${product.slug}`}>
                <div className="group relative h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                  <Image
                    src={product.images[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 text-white w-full">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-200">
                        {product.price}₹
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why CartIQ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered",
                description:
                  "Smart AI chat to help you find the perfect products",
                icon: "🤖",
              },
              {
                title: "Multi-Vendor",
                description: "Browse products from trusted sellers worldwide",
                icon: "🏪",
              },
              {
                title: "Secure Checkout",
                description:
                  "Multiple payment options with buyer protection",
                icon: "🔒",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg text-center shadow hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}