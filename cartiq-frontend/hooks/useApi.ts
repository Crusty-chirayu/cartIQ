"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (
      method: "get" | "post" | "put" | "patch" | "delete",
      url: string,
      data?: any,
      options: UseApiOptions = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        // ✅ FIX: handle GET separately
        if (method === "get") {
          response = await apiClient.get(url);
        } else {
          response = await apiClient[method](url, data);
        }

        if (options.showToast !== false && response.data?.message) {
          toast.success(response.data.message);
        }

        options.onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to connect to server";

        console.error(`API Error (${method.toUpperCase()} ${url}):`, {
          message: errorMessage,
          status: err.response?.status,
          data: err.response?.data,
        });

        setError(errorMessage);

        if (options.showToast !== false) {
          toast.error(errorMessage);
        }

        options.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    get: (url: string, options?: UseApiOptions) =>
      request("get", url, undefined, options),
    post: (url: string, data: any, options?: UseApiOptions) =>
      request("post", url, data, options),
    put: (url: string, data: any, options?: UseApiOptions) =>
      request("put", url, data, options),
    patch: (url: string, data: any, options?: UseApiOptions) =>
      request("patch", url, data, options),
    delete: (url: string, options?: UseApiOptions) =>
      request("delete", url, undefined, options),
    loading,
    error,
    setError,
  };
};