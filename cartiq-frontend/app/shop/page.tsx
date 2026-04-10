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
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, [currentPage, currentSort, minPrice, maxPrice, category, searchQuery]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header with Animation */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 animate-fadeInUp">
          <h1 className="text-4xl font-bold mb-6">Discover Amazing Products</h1>
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder="🔍 Search products by name, category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-6 py-3 text-base text-gray-900 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-all duration-300 shadow-md group-hover:shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20 shadow-lg hover:shadow-xl transition-shadow"
              style={{animation: 'slideInRight 0.5s ease-out'}}>
              <SortFilter
                sortOptions={SORT_OPTIONS}
                currentSort={currentSort}
                onSortChange={setCurrentSort}
              />

              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  💰 Price Range
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

          {/* Products */}
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