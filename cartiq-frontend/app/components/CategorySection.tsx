"use client";

import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';

const categories = [
{
  name: 'Electronics',
  count: '12,400+ items',
  image: "https://images.unsplash.com/photo-1639733755368-7d0b2507e429",
  alt: 'Modern electronics including laptops, phones and gadgets on a clean desk',
  color: 'from-blue-900/60',
  size: 'large'
},
{
  name: 'Fashion',
  count: '8,200+ items',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d1d5e9a0-1772446868434.png",
  alt: 'Stylish clothing and fashion accessories arranged elegantly',
  color: 'from-rose-900/60',
  size: 'normal'
},
{
  name: 'Home & Living',
  count: '5,600+ items',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1c81c1ed9-1772446865792.png",
  alt: 'Beautiful modern home furniture and interior decor',
  color: 'from-amber-900/60',
  size: 'normal'
},
{
  name: 'Sports',
  count: '3,800+ items',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_117456766-1772446867221.png",
  alt: 'Sports equipment and athletic gear for all activities',
  color: 'from-green-900/60',
  size: 'normal'
},
{
  name: 'Beauty',
  count: '4,100+ items',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_19ee610c2-1772446872653.png",
  alt: 'Premium beauty products and skincare arranged artfully',
  color: 'from-purple-900/60',
  size: 'normal'
}];


export default function CategorySection() {
  return (
    <section className="py-16 max-w-content mx-auto px-4 sm:px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-cartiq-accent uppercase tracking-widest mb-2 font-heading">
            Explore
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-cartiq-foreground tracking-tight">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-2 text-sm font-semibold text-cartiq-muted hover:text-cartiq-foreground transition-colors font-heading">
          
          All Categories
          <span className="w-6 h-6 rounded-full bg-cartiq-bg-secondary flex items-center justify-center">
            →
          </span>
        </Link>
      </div>
      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
        {/* Large - Electronics */}
        <Link
          href={`/products?category=${categories?.[0]?.name?.toLowerCase()}`}
          className="col-span-2 row-span-2 relative rounded-cartiq-xl overflow-hidden group cursor-pointer">
          
          <AppImage
            src={categories?.[0]?.image}
            alt={categories?.[0]?.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105" />
          
          <div className={`absolute inset-0 bg-gradient-to-t ${categories?.[0]?.color} to-transparent opacity-80 group-hover:opacity-90 transition-opacity`} />
          <div className="absolute bottom-0 left-0 p-6">
            <p className="text-white/60 text-xs font-mono mb-1">{categories?.[0]?.count}</p>
            <h3 className="text-white text-2xl font-bold font-heading">{categories?.[0]?.name}</h3>
            <span className="inline-flex items-center gap-1.5 mt-2 text-white/80 text-sm font-medium font-heading group-hover:text-white transition-colors">
              Shop now →
            </span>
          </div>
        </Link>

        {/* Small cards */}
        {categories?.slice(1)?.map((cat) =>
        <Link
          key={cat?.name}
          href={`/products?category=${cat?.name?.toLowerCase()}`}
          className="relative rounded-cartiq-xl overflow-hidden group cursor-pointer">
          
            <AppImage
            src={cat?.image}
            alt={cat?.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110" />
          
            <div className={`absolute inset-0 bg-gradient-to-t ${cat?.color} to-transparent opacity-75 group-hover:opacity-90 transition-opacity`} />
            <div className="absolute bottom-0 left-0 p-4">
              <p className="text-white/60 text-[10px] font-mono mb-0.5">{cat?.count}</p>
              <h3 className="text-white text-base font-bold font-heading leading-tight">{cat?.name}</h3>
            </div>
          </Link>
        )}
      </div>
    </section>);

}