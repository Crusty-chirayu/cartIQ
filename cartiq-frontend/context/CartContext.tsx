"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CartItem, Product } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variant?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems, isLoaded] = useLocalStorage<CartItem[]>(
    "cartItems",
    []
  );
  const [items, setItems] = useState<CartItem[]>([]);

  // Sync items when localStorage is loaded
  useEffect(() => {
    if (isLoaded) {
      setItems(cartItems);
    }
  }, [isLoaded, cartItems]);

  const addItem = (product: Product, quantity: number, variant?: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          item.product._id === product._id && item.variant === variant
      );

      if (existingItem) {
        const updated = prevItems.map((item) =>
          item._id === existingItem._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        setCartItems(updated);
        return updated;
      }

      const newItem: CartItem = {
        _id: Date.now().toString(),
        product,
        quantity,
        variant,
        addedAt: new Date().toISOString(),
      };

      const updated = [...prevItems, newItem];
      setCartItems(updated);
      return updated;
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((item) => item._id !== itemId);
      setCartItems(updated);
      return updated;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prevItems) => {
      const updated = prevItems.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      );
      setCartItems(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCartItems([]);
  };

  const getTotal = () => {
    return items.reduce(
      (total, item) =>
        total +
        (item.product.discountPrice || item.product.price) * item.quantity,
      0
    );
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
