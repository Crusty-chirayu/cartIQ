"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { cartApi } from "@/lib/api";
import type { Product } from "@/lib/api";
import Icon from "@/components/ui/AppIcon";
import AppImage from "@/components/ui/AppImage";

interface ProductCardProps {
  product: Product;
  size?: "sm" | "md" | "lg";
}

export default function ProductCard({ product, size = "md" }: ProductCardProps) {
  const { user, dispatch, refreshCart, showToast } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: "login" });
      return;
    }

    setIsAdding(true);
    try {
      await cartApi.add({ productId: product._id, quantity: 1 });
      await refreshCart();
      showToast(`${product.name} added to cart!`, "success");
      dispatch({ type: "TOGGLE_CART", payload: true });
    } catch {
      showToast("Failed to add to cart", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const imageHeightClass =
    size === "sm" ? "h-44" : size === "lg" ? "h-72" : "h-56";

  return (
    // 🔥 IMPORTANT CHANGE — correct dynamic route
<Link href={`/product/${product._id}`} className="block group">      <div className="product-card h-full">
        {/* Image */}
        <div className={`relative ${imageHeightClass} bg-cartiq-bg-secondary overflow-hidden`}>
          <AppImage
            src={product.image || "/assets/images/no_image.png"}
            alt={product.name}
            fill
            className="product-card-image object-cover"
          />

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-card"
          >
            <Icon
              name="HeartIcon"
              variant={isWishlisted ? "solid" : "outline"}
              size={15}
              className={isWishlisted ? "text-red-500" : "text-cartiq-muted"}
            />
          </button>

          {/* Quick Add */}
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.countInStock === 0}
              className="w-full bg-cartiq-dark text-white text-xs font-semibold py-3 flex items-center justify-center gap-2 hover:bg-cartiq-dark-secondary transition-colors font-heading disabled:opacity-50"
            >
              {isAdding ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon name="ShoppingBagIcon" size={14} />
              )}
              {product.countInStock === 0
                ? "Out of Stock"
                : isAdding
                ? "Adding…"
                : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] font-semibold text-cartiq-subtle uppercase tracking-wider mb-1 font-heading">
            {product.category}
          </p>

          <h3 className="text-sm font-semibold text-cartiq-foreground line-clamp-2 mb-2 font-heading leading-snug group-hover:text-cartiq-accent transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(product.rating) ? "star-filled" : "star-empty"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[11px] text-cartiq-subtle font-mono">
                ({product.numReviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="price-current text-base">₹{product.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}