"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { Order } from "@/types";
import { Badge, Loader, EmptyState } from "@/components/ui";
import { formatPrice, formatDate } from "@/utils/helpers";
import Footer from "@/components/Footer";

export default function OrdersPage() {
  const { get, loading } = useApi();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const response = await get("/orders", { showToast: false });
        setOrders(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch orders");
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Please sign in
          </h1>
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Loader fullScreen={false} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="You haven't placed any orders yet"
            action={{
              label: "Start Shopping",
              onClick: () => (window.location.href = "/shop"),
            }}
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold text-gray-900">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Placed on</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                          ? "danger"
                          : "primary"
                      }
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between items-center text-gray-600"
                      >
                        <span>
                          {item.product.name} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracking */}
                {order.trackingId && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold text-gray-900">
                      {order.trackingId}
                    </p>
                  </div>
                )}

                {/* Action */}
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-700 font-semibold">
                    View Details
                  </button>
                  {["pending", "confirmed"].includes(order.status) && (
                    <button className="text-red-600 hover:text-red-700 font-semibold">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
