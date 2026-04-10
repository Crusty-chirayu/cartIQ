"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Order } from "@/types";
import { Badge, Button, Input, Loader } from "@/components/ui";
import { formatDate, formatPrice } from "@/utils/helpers";
import Footer from "@/components/Footer";

export default function AdminOrdersPage() {
  const { get, patch } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await get("/admin/orders", { showToast: false });
        setOrders(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await patch(`/admin/orders/${orderId}`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: status as any } : o))
      );
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const filteredOrders = orders.filter((o) => o._id.includes(search));

  if (loading) return <Loader fullScreen />;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <Input
            placeholder="Search order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>

        <div className="bg-white rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                          ? "danger"
                          : "primary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleUpdateStatus(order._id, e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </main>
  );
}

  }

  useEffect(() => {

    fetchOrders()

  }, [])

  const updateStatus = async (id: string, status: string) => {

    try {

      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ status })

      })

      const updatedOrder = await res.json()

      setOrders(prev =>
        prev.map(order =>
          order._id === id ? updatedOrder : order
        )
      )

    } catch (error) {

      console.log("Update failed:", error)

    }

  }

  if (loading) {

    return <p>Loading orders...</p>

  }

  return (

    <div className="space-y-8">

      <h1 className="text-3xl font-bold">
        Orders
      </h1>

      <table className="w-full border bg-white">

        <thead>

          <tr className="bg-gray-200">

            <th className="p-3 text-left">Order ID</th>
            <th className="p-3 text-left">Items</th>
            <th className="p-3 text-left">Total</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Actions</th>

          </tr>

        </thead>

        <tbody>

          {orders.map((order) => (

            <tr key={order._id} className="border-t">

              <td className="p-3">
                {order._id.slice(-6)}
              </td>

              <td className="p-3">
                {order.items.length} items
              </td>

              <td className="p-3">
                ₹{order.totalPrice}
              </td>

              <td className="p-3">
                {order.status}
              </td>

              <td className="p-3">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>

              <td className="p-3 space-x-3">

                <button
                  onClick={() => updateStatus(order._id, "Shipped")}
                  className="text-blue-600"
                >
                  Ship
                </button>

                <button
                  onClick={() => updateStatus(order._id, "Delivered")}
                  className="text-green-600"
                >
                  Deliver
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}