"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui";
import { Loader } from "@/components/ui";

export default function VendorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { get, loading } = useApi();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    avgRating: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStats = async () => {
      try {
        const response = await get("/vendor/stats", { showToast: false });
        setStats(response?.data || {});
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  if (!isAuthenticated || user?.role !== "seller") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only sellers can access this page</p>
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-fadeInUp">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome back, {user?.name}! 👋</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Products", value: stats.totalProducts, icon: "📦", color: "from-blue-500 to-blue-600" },
              { label: "Total Sales", value: `$${stats.totalSales}`, icon: "💰", color: "from-green-500 to-green-600" },
              { label: "Total Orders", value: stats.totalOrders, icon: "🛒", color: "from-purple-500 to-purple-600" },
              { label: "Avg Rating", value: `${stats.avgRating?.toFixed(1) || 0}⭐`, icon: "⭐", color: "from-yellow-500 to-yellow-600" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fadeInUp`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/vendor/products/add">
                <Button variant="primary" fullWidth size="lg" className="animate-pulse-glow">
                  ➕ Add New Product
                </Button>
              </Link>
              <Link href="/vendor/kyc">
                <Button variant="outline" fullWidth size="lg">
                  📋 Complete KYC
                </Button>
              </Link>
              <Link href="/vendor/products">
                <Button variant="outline" fullWidth size="lg">
                  📦 View My Products
                </Button>
              </Link>
              <Link href="/vendor/orders">
                <Button variant="outline" fullWidth size="lg">
                  🛒 View Orders
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          {loading ? (
            <div className="flex justify-center">
              <Loader />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
              <ul className="space-y-4">
                {[
                  "Complete your store profile ✓",
                  "Add high-quality product images",
                  "Set competitive pricing",
                  "Enable shipping options",
                  "Start receiving orders",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center text-gray-700 text-lg hover:text-blue-600 transition-colors">
                    <span className="text-2xl mr-4">✨</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
