"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { cartApi } from '@/lib/api';
import type { CartItem } from '@/lib/api';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function CartSidebar() {
  const { cart, isCartOpen, dispatch, refreshCart, showToast } = useApp();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleUpdateQty = async (item: CartItem, newQty: number) => {
    setUpdatingId(item.productId);
    try {
      if (newQty <= 0) {
        await cartApi.remove(item.productId);
        showToast('Item removed from cart', 'info');
      } else {
        await cartApi.update({ productId: item.productId, quantity: newQty });
      }
      await refreshCart();
    } catch {
      showToast('Failed to update cart', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setUpdatingId(productId);
    try {
      await cartApi.remove(productId);
      await refreshCart();
      showToast('Item removed', 'info');
    } catch {
      showToast('Failed to remove item', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="cart-overlay"
        onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
      />

      {/* Sidebar */}
      <div className="cart-sidebar">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cartiq-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="ShoppingBagIcon" size={20} />
            <h2 className="text-base font-semibold font-heading text-cartiq-foreground">
              Your Cart
            </h2>
            {cart.length > 0 && (
              <span className="bg-cartiq-dark text-white text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cartiq-bg-secondary transition-colors text-cartiq-muted"
            aria-label="Close cart"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-cartiq-bg-secondary flex items-center justify-center">
                <Icon name="ShoppingBagIcon" size={28} className="text-cartiq-subtle" />
              </div>
              <div>
                <p className="font-semibold text-cartiq-foreground font-heading">Your cart is empty</p>
                <p className="text-sm text-cartiq-muted mt-1">Add items to get started</p>
              </div>
              <Link
                href="/products"
                onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.productId}-${item.variant}`} className="flex gap-3">
                <div className="w-18 h-18 rounded-xl overflow-hidden bg-cartiq-bg-secondary flex-shrink-0 w-[72px] h-[72px]">
                  <AppImage
                    src={item.product.images?.[0] || ''}
                    alt={item.product.name}
                    width={72}
                    height={72}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product-detail?id=${item.productId}`}
                    onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
                    className="text-sm font-medium text-cartiq-foreground hover:text-cartiq-accent transition-colors line-clamp-2 font-heading"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-cartiq-muted mt-0.5">{item.variant}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        className="qty-btn"
                        onClick={() => handleUpdateQty(item, item.quantity - 1)}
                        disabled={updatingId === item.productId}
                        aria-label="Decrease quantity"
                      >
                        <Icon name="MinusIcon" size={12} />
                      </button>
                      <span className="w-7 text-center text-sm font-medium font-mono">
                        {updatingId === item.productId ? (
                          <span className="inline-block w-3 h-3 border-2 border-cartiq-accent border-t-transparent rounded-full animate-spin" />
                        ) : item.quantity}
                      </span>
                      <button
                        className="qty-btn"
                        onClick={() => handleUpdateQty(item, item.quantity + 1)}
                        disabled={updatingId === item.productId}
                        aria-label="Increase quantity"
                      >
                        <Icon name="PlusIcon" size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="price-current text-sm">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        disabled={updatingId === item.productId}
                        className="text-cartiq-subtle hover:text-cartiq-error transition-colors"
                        aria-label="Remove item"
                      >
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-cartiq-border px-5 py-4 space-y-3 flex-shrink-0 bg-cartiq-bg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-cartiq-muted">Subtotal</span>
              <span className="font-semibold font-mono text-cartiq-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-cartiq-subtle">Shipping calculated at checkout</span>
            </div>
            <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2">
              <Icon name="LockClosedIcon" size={15} />
              Checkout · ${subtotal.toFixed(2)}
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
              className="btn-outline w-full py-2.5 text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}