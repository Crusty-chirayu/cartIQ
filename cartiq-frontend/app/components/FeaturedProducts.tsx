"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/api";
import type { Product } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import Icon from "@/components/ui/AppIcon";

const TABS = ["All", "Electronics", "Fashion", "Home", "Sports", "Beauty"];

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // 🔥 IMPORTANT — backend now returns ARRAY not {products:[]}
        const data: Product[] = await productsApi.getAll();

        let filtered = data;

        // category filter
        if (activeTab !== "All") {
          filtered = data.filter(
            (p) => p.category?.toLowerCase() === activeTab.toLowerCase()
          );
        }

        setProducts(filtered);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [activeTab]);

  return (
    <section className="py-16 bg-cartiq-bg-secondary">
      <div className="max-w-content mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-cartiq-accent uppercase tracking-widest mb-2 font-heading">
              Curated for You
            </p>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-cartiq-foreground tracking-tight">
              Featured Products
            </h2>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-semibold text-cartiq-muted hover:text-cartiq-foreground transition-colors font-heading"
          >
            View All Products
            <Icon name="ArrowRightIcon" size={15} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`filter-chip px-4 py-2 whitespace-nowrap ${
                activeTab === tab ? "active" : ""
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Icon
              name="ArchiveBoxXMarkIcon"
              size={40}
              className="text-cartiq-subtle mx-auto mb-3"
            />
            <p className="text-cartiq-muted font-heading">
              No products found in this category
            </p>
          </div>
        )}
      </div>
    </section>
  );
}