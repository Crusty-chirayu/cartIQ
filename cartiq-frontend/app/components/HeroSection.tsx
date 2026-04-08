"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function HeroSection() {
  const { dispatch } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productsApi.getFeatured();
          setFeaturedProducts(data.products.slice(0, 4));
      } catch {
        // Use placeholders
      } finally {
        setIsLoaded(true);
      }
    };
    load();

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1600&q=80',
  ];

  const heroContent = [
    { headline: 'Discover Your', accent: 'Perfect Style', sub: 'Curated collections for every occasion and lifestyle.' },
    { headline: 'Fashion That', accent: 'Moves With You', sub: 'Premium apparel designed for the modern lifestyle.' },
    { headline: 'Performance', accent: 'Redefined', sub: 'Gear up with the latest in athletic innovation.' },
    { headline: 'Capture Every', accent: 'Moment', sub: 'Professional-grade electronics for creators.' },
  ];

  const active = heroContent[activeIndex];

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-cartiq-dark">
      {/* Background Images */}
      {heroImages.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === activeIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <AppImage
            src={img}
            alt={`Hero background ${i + 1} showing featured products`}
            fill
            priority={i === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 hero-gradient-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-2xl">
          {/* Tag */}
          <div
            key={`tag-${activeIndex}`}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 animate-fade-in font-heading"
          >
            <span className="w-1.5 h-1.5 bg-cartiq-accent rounded-full animate-pulse" />
            New Arrivals · Spring 2026
          </div>

          {/* Headline */}
          <div key={`headline-${activeIndex}`} className="animate-fade-up mb-6">
            <h1 className="font-heading font-bold text-white leading-[1.05] text-5xl md:text-6xl lg:text-7xl tracking-tight">
              {active.headline}
              <br />
              <span
                className="text-transparent"
                style={{
                  WebkitTextStroke: '2px #E8A020',
                }}
              >
                {active.accent}
              </span>
            </h1>
          </div>

          <p
            key={`sub-${activeIndex}`}
            className="text-white/75 text-lg md:text-xl mb-8 leading-relaxed max-w-lg animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          >
            {active.sub}
          </p>

          {/* CTAs */}
          <div
            className="flex items-center gap-4 animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Link
              href="/products"
              className="btn-accent px-7 py-3.5 text-sm flex items-center gap-2"
            >
              Shop Now
              <Icon name="ArrowRightIcon" size={16} />
            </Link>
            <button
              onClick={() => dispatch({ type: 'OPEN_AUTH_MODAL', payload: 'register' })}
              className="px-7 py-3.5 text-sm font-semibold text-white border border-white/30 rounded-cartiq-md hover:bg-white/10 transition-all duration-150 font-heading flex items-center gap-2"
            >
              <Icon name="SparklesIcon" size={16} />
              Join CartIQ
            </button>
          </div>
        </div>
      </div>

      {/* Floating Stats Card */}
      <div className="absolute bottom-12 right-6 md:right-12 z-10 animate-float hidden md:block">
        <div className="glass-card-dark rounded-cartiq-lg px-5 py-4 min-w-[200px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cartiq-accent/20 flex items-center justify-center">
              <Icon name="ShoppingBagIcon" size={16} className="text-cartiq-accent" />
            </div>
            <div>
              <p className="text-white text-sm font-bold font-heading">50K+ Products</p>
              <p className="text-white/50 text-xs">Across all categories</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=80'].map((src, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-cartiq-dark overflow-hidden">
                  <AppImage src={src} alt={`Customer ${i + 1} avatar`} width={28} height={28} className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-white/60 text-xs">2M+ happy customers</p>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === activeIndex ? 'w-6 h-2 bg-cartiq-accent' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Featured product overlay if available */}
      {isLoaded && featuredProducts[activeIndex] && (
        <Link
          href={`/product-detail?id=${featuredProducts[activeIndex]._id}`}
          className="absolute bottom-12 left-6 md:left-12 z-10 hidden lg:block"
        >
          <div className="glass-card rounded-cartiq-lg px-4 py-3 flex items-center gap-3 hover:bg-white/95 transition-colors max-w-[260px]">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-cartiq-bg-secondary flex-shrink-0">
              <AppImage
                src={featuredProducts[activeIndex].images?.[0] || ''}
                alt={featuredProducts[activeIndex].name}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-cartiq-foreground truncate font-heading">
                {featuredProducts[activeIndex].name}
              </p>
              <p className="text-sm font-bold text-cartiq-accent font-mono">
                ${featuredProducts[activeIndex].price.toFixed(2)}
              </p>
            </div>
            <Icon name="ArrowRightIcon" size={14} className="text-cartiq-muted flex-shrink-0" />
          </div>
        </Link>
      )}
    </section>
  );
}