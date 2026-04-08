"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import SkeletonCard from '@/components/SkeletonCard';
import Icon from '@/components/ui/AppIcon';

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
          const data = await productsApi.getNewArrivals();
        setProducts(data.products);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="py-16 max-w-content mx-auto px-4 sm:px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-cartiq-accent uppercase tracking-widest mb-2 font-heading">
            Just Dropped
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-cartiq-foreground tracking-tight">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/products?sort=newest"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-cartiq-muted hover:text-cartiq-foreground transition-colors font-heading"
        >
          See All New
          <Icon name="ArrowRightIcon" size={15} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {products.map((product, i) => (
            <div
              key={product._id}
              className="scroll-reveal-hidden is-visible"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <ProductCard product={product} size="lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-cartiq-muted">
          <Icon name="SparklesIcon" size={32} className="mx-auto mb-2 text-cartiq-subtle" />
          <p className="font-heading">New arrivals coming soon</p>
        </div>
      )}
    </section>
  );
}