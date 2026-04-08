"use client";

import { useApp } from "@/context/AppContext";

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <div
        className={`${colors[toast.type] || "bg-gray-800"} text-white px-4 py-3 rounded-lg shadow-lg animate-slide-up`}
      >
        {toast.message}
      </div>
    </div>
  );
}