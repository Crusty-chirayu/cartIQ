"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Loader, Pagination, EmptyState } from "@/components/ui";
import SortFilter from "@/components/SortFilter";
import PriceRange from "@/components/PriceRange";
import Footer from "@/components/Footer";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low-high", label: "Price: Low to High" },
  { value: "price-high-low", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const { get, loading } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSort, setCurrentSort] = useState("newest");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [searchQuery, setSearchQuery] = useState("");

  const category = searchParams.get("category") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
          sort: currentSort,
          minPrice: minPrice.toString(),
          maxPrice: maxPrice.toString(),
          ...(category && { category }),
          ...(searchQuery && { search: searchQuery }),
        });

        const response = await get(`/products?${query}`, {
          showToast: false,
        });

        setProducts(response?.data || []);
        setTotalPages(response?.pagination?.pages || 1);
      } catch (err) {
        console.error("Failed to fetch products");
      }
    };

    fetchProducts();
  }, [currentPage, currentSort, minPrice, maxPrice, category, searchQuery]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Shop Products
          </h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <SortFilter
                sortOptions={SORT_OPTIONS}
                currentSort={currentSort}
                onSortChange={setCurrentSort}
              />

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Price Range
                </h3>
                <PriceRange
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onPriceChange={(min, max) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <Loader fullScreen={false} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your filters or search terms"
              />
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-6">
                  Showing {(currentPage - 1) * 12 + 1} to{" "}
                  {Math.min(currentPage * 12, products.length)} products
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
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