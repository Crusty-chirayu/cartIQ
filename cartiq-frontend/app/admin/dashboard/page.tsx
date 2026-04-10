"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { Button, Loader, Badge, EmptyState } from "@/components/ui";
import Footer from "@/components/Footer";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalGMV: number;
  pendingKYC: number;
}

export default function AdminDashboardPage() {
  const { get } = useApi();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") return;

    const fetchStats = async () => {
      try {
        const response = await get("/admin/stats", { showToast: false });
        setStats(response?.data || response);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Only admins can access this page</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Dashboard
        </h1>

        {loading ? (
          <Loader fullScreen={false} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[
              {
                label: "Total Users",
                value: stats?.totalUsers || 0,
                icon: "👥",
              },
              {
                label: "Total Products",
                value: stats?.totalProducts || 0,
                icon: "📦",
              },
              {
                label: "Total Orders",
                value: stats?.totalOrders || 0,
                icon: "📋",
              },
              {
                label: "Total GMV",
                value: `₹${stats?.totalGMV || 0}`,
                icon: "💹",
              },
              {
                label: "Pending KYC",
                value: stats?.pendingKYC || 0,
                variant: stats?.pendingKYC ? "danger" : "success",
                icon: "⚠️",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-6 ${
                  stat.variant === "danger" ? "bg-red-50" : "bg-white"
                }`}
              >
                <p className="text-2xl mb-2">{stat.icon}</p>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Manage Users", href: "/admin/users" },
            { label: "Manage Products", href: "/admin/products" },
            { label: "Manage Orders", href: "/admin/orders" },
            { label: "Verify Sellers", href: "/admin/sellers" },
            { label: "KYC Verification", href: "/admin/kyc" },
            { label: "Transactions", href: "/admin/transactions" },
            { label: "Analytics", href: "/admin/analytics" },
          ].map((action, idx) => (
            <a key={idx} href={action.href}>
              <Button variant="outline" fullWidth size="lg">
                {action.label} →
              </Button>
            </a>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
