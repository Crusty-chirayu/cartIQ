"use client"

import { useEffect, useState } from "react"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  items: OrderItem[]
  totalPrice: number
  status: string
  createdAt: string
}

export default function AdminOrdersPage() {

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {

    const res = await fetch("http://localhost:5000/api/orders")
    const data = await res.json()

    setOrders(data)
    setLoading(false)

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