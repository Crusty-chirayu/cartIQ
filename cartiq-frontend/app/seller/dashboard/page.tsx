"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { Button, Loader, EmptyState } from "@/components/ui";
import Footer from "@/components/Footer";

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalRating: number;
}

export default function SellerDashboardPage() {
  const { get } = useApi();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "seller") return;

    const fetchStats = async () => {
      try {
        const response = await get("/seller/stats", { showToast: false });
        setStats(response?.data || response);
      } catch (err) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "seller") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Only sellers can access this page</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Seller Dashboard
        </h1>

        {loading ? (
          <Loader fullScreen={false} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
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
                label: "Total Revenue",
                value: `₹${stats?.totalRevenue || 0}`,
                icon: "💰",
              },
              {
                label: "Rating",
                value: `${stats?.totalRating || 0} ⭐`,
                icon: "⭐",
              },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6">
                <p className="text-2xl mb-2">{stat.icon}</p>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Manage Products", href: "/seller/products" },
            { label: "Manage Orders", href: "/seller/orders" },
            { label: "View Analytics", href: "/seller/analytics" },
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
