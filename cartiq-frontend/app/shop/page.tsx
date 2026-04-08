"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return (
      <div className="text-white p-10">
        Loading products...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-10">
        Shop
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

        {products.map((product) => (

          <Link
            key={product._id}
            href={`/product/${product._id}`}
            className="bg-gray-900 rounded-xl p-4 hover:scale-105 transition"
          >

            <AppImage
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="rounded-lg mb-4"
            />

            <h3 className="font-semibold">
              {product.name}
            </h3>

            <p className="text-gray-400 text-sm">
              {product.category}
            </p>

            <p className="text-lg font-bold mt-2">
              ₹{product.price}
            </p>

          </Link>

        ))}

      </div>

    </div>
  );
}