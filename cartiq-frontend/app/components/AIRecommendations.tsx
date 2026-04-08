"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { aiApi, productsApi } from '@/lib/api';
import type { Product } from '@/lib/api';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function AIRecommendations() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
          const data = await aiApi.getRecommendations();
        setProducts(data.products.slice(0, 4));
      } catch {
        // Fallback to regular recommended
        try {
            const fallback = await productsApi.getFeatured();
              setProducts(fallback.products.slice(0, 4));
        } catch {
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="py-16 bg-cartiq-dark">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-ai flex items-center gap-1.5">
                <Icon name="SparklesIcon" size={10} />
                AI Powered
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">
              Picked For You
            </h2>
            <p className="text-white/50 text-sm mt-2 max-w-md">
              Our AI analyzes trends and your preferences to surface products you'll love.
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-semibold text-cartiq-accent hover:text-cartiq-accent-hover transition-colors font-heading self-start md:self-auto"
          >
            Explore All
            <Icon name="ArrowRightIcon" size={15} />
          </Link>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-cartiq-lg overflow-hidden">
                <div className="skeleton h-52 w-full bg-white/10" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-16 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                  <div className="h-5 w-20 rounded bg-white/10 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <Link
                key={product._id}
                href={`/product-detail?id=${product._id}`}
                className="group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="bg-white/5 border border-white/10 rounded-cartiq-lg overflow-hidden hover:border-cartiq-accent/50 hover:bg-white/8 transition-all duration-300">
                  <div className="relative h-52 overflow-hidden">
                    <AppImage
                      src={product.images?.[0] || ''}
                      alt={`${product.name} - AI recommended product`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="badge-ai flex items-center gap-1">
                        <Icon name="SparklesIcon" size={9} />
                        AI Pick
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1 font-heading">
                      {product.category}
                    </p>
                    <h3 className="text-white text-sm font-semibold font-heading line-clamp-2 mb-2 group-hover:text-cartiq-accent transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold font-mono text-base">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-cartiq-accent" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-white/50 text-xs font-mono">{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/40 font-heading">Recommendations loading…</p>
          </div>
        )}

        {/* AI Chat CTA */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-cartiq-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Icon name="ChatBubbleLeftRightIcon" size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold font-heading">Chat with CartIQ AI</h3>
              <p className="text-white/50 text-sm">Get personalized product recommendations instantly</p>
            </div>
          </div>
          <button className="btn-accent px-6 py-2.5 text-sm flex items-center gap-2 flex-shrink-0">
            <Icon name="SparklesIcon" size={15} />
            Try AI Assistant
          </button>
        </div>
      </div>
    </section>
  );
}