"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";

interface ToastOptions {
  duration?: number;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}

export const useNotification = () => {
  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      toast.success(message, {
        duration: 3000,
        position: "top-right",
        ...options,
      });
    },
    []
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      toast.error(message, {
        duration: 3000,
        position: "top-right",
        ...options,
      });
    },
    []
  );

  const loading = useCallback((message: string = "Loading...") => {
    return toast.loading(message, {
      position: "top-right",
    });
  }, []);

  const update = useCallback(
    (
      toastId: string,
      message: string,
      type: "success" | "error" | "loading",
      options?: ToastOptions
    ) => {
      toast(message, {
        id: toastId,
        icon:
          type === "success" ? "✓" : type === "error" ? "✕" : "⟳",
      });
    },
    []
  );

  return { success, error, loading, update };
};
