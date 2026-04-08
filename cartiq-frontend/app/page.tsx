"use client";

import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  countInStock: number;
};

export default function ProductPage({ params }: any) {
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    const fetchProduct = async () => {
      const res = await fetch(
        `http://localhost:5000/api/products/${params.id}`
      );
      const data = await res.json();
      setProduct(data);
    };

    fetchProduct();
  }, [params]);

  if (!product)
    return <div className="text-white p-10 text-xl">Loading...</div>;

  return (
    <div className="text-white p-10 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-10">
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded-lg"
        />

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-400 mb-6">{product.description}</p>
          <p className="text-3xl font-semibold mb-4">₹{product.price}</p>
          <p className="mb-6">
            {product.countInStock > 0
              ? "In Stock"
              : "Out of Stock"}
          </p>

          <button className="bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}