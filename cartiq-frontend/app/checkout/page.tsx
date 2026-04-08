"use client";

import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function CheckoutPage() {

  const { cart, refreshCart, showToast } = useApp();

  const total = cart.reduce(
    (sum: number, item: any) =>
      sum + item.product.price * item.quantity,
    0
  );

  const placeOrder = async () => {

    if (cart.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    const items = cart.map((item: any) => ({
      productId: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image,
    }));

    try {

      await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          totalPrice: total,
        }),
      });

      showToast("Order placed successfully!", "success");

      await refreshCart();

    } catch {
      showToast("Order failed", "error");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-10 text-center">

        <h1 className="text-3xl font-bold mb-6">
          Your Cart is Empty
        </h1>

        <Link
          href="/shop"
          className="bg-white text-black px-6 py-3 rounded"
        >
          Go to Products
        </Link>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-3xl font-bold mb-8">
        Checkout
      </h1>

      <div className="space-y-4">

        {cart.map((item: any) => (
          <div
            key={item.product._id}
            className="flex justify-between border-b border-gray-700 pb-3"
          >
            <span>{item.product.name}</span>

            <span>
              ₹{item.product.price} x {item.quantity}
            </span>
          </div>
        ))}

      </div>

      <div className="mt-8 text-xl font-semibold">
        Total: ₹{total}
      </div>

      <button
        onClick={placeOrder}
        className="mt-6 bg-white text-black px-6 py-3 rounded"
      >
        Place Order
      </button>

    </div>
  );
}