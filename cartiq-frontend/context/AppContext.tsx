"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { cartApi } from "@/lib/api";

/* ---------------- TYPES ---------------- */

export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: string;
  product: any;
}

/* ---------------- STATE ---------------- */

interface AppState {
  user: User | null;
  isAuthLoading: boolean;
  cart: CartItem[];
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  authMode: "login" | "register";
  cartItemCount: number;
  toast: { message: string; type: "success" | "error" | "info" } | null;
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTH_LOADING"; payload: boolean }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "TOGGLE_CART"; payload?: boolean }
  | { type: "OPEN_AUTH_MODAL"; payload: "login" | "register" }
  | { type: "CLOSE_AUTH_MODAL" }
  | { type: "SHOW_TOAST"; payload: { message: string; type: "success" | "error" | "info" } }
  | { type: "HIDE_TOAST" };

const initialState: AppState = {
  user: null,
  isAuthLoading: false,
  cart: [],
  isCartOpen: false,
  isAuthModalOpen: false,
  authMode: "login",
  cartItemCount: 0,
  toast: null,
};

/* ---------------- REDUCER ---------------- */

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_AUTH_LOADING":
      return { ...state, isAuthLoading: action.payload };

    case "SET_CART":
      return {
        ...state,
        cart: action.payload,
        cartItemCount: action.payload.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
      };

    case "TOGGLE_CART":
      return { ...state, isCartOpen: action.payload ?? !state.isCartOpen };

    case "OPEN_AUTH_MODAL":
      return { ...state, isAuthModalOpen: true, authMode: action.payload };

    case "CLOSE_AUTH_MODAL":
      return { ...state, isAuthModalOpen: false };

    case "SHOW_TOAST":
      return { ...state, toast: action.payload };

    case "HIDE_TOAST":
      return { ...state, toast: null };

    default:
      return state;
  }
}

/* ---------------- CONTEXT ---------------- */

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  logout: () => void;
  refreshCart: () => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const AppContext = createContext<AppContextType | null>(null);

/* ---------------- PROVIDER ---------------- */

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      dispatch({ type: "SHOW_TOAST", payload: { message, type } });
      setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 3000);
    },
    []
  );

  const refreshCart = useCallback(async () => {
    try {
      const res = await cartApi.get();

      // 🔥 FIX: support both axios and fetch responses
      const data = res?.data ? res.data : res;

      dispatch({ type: "SET_CART", payload: data || [] });
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    dispatch({ type: "SET_USER", payload: null });
    dispatch({ type: "SET_CART", payload: [] });
  }, []);

  /* 🔥 LOAD USER FROM LOCAL STORAGE */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch({ type: "SET_USER", payload: parsedUser });
        refreshCart();
      } catch (err) {
        console.error("User parse error:", err);
        localStorage.removeItem("user");
      }
    }
  }, [refreshCart]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        dispatch,
        logout,
        refreshCart,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}