"use client";

const promos = [
  '🚚 Free shipping on orders over $50',
  '✨ New arrivals every week',
  '🔒 Secure checkout guaranteed',
  '↩️ 30-day hassle-free returns',
  '🎁 Exclusive member deals — Join free',
  '⚡ Same-day dispatch on in-stock items',
];

export default function PromoBar() {
  return (
    <div className="bg-cartiq-dark overflow-hidden py-2.5">
      <div className="flex items-center animate-marquee whitespace-nowrap">
        {[...promos, ...promos]?.map((promo, i) => (
          <span key={i} className="inline-flex items-center gap-8 text-white/80 text-xs font-medium font-heading px-8">
            {promo}
            <span className="text-white/20">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}