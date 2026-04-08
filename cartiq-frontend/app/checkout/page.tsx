"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useNotification } from "@/hooks/useNotification";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Loader } from "@/components/ui";
import { formatPrice } from "@/utils/helpers";
import Footer from "@/components/Footer";

interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { post } = useApi();
  const { success, error } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "upi" | "wallet" | "cod"
  >("card");
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<ShippingAddress>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const subtotal = getTotal();
  const tax = Math.round(subtotal * 0.05);
  const shipping = 99;
  const total = subtotal + tax + shipping;

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.street) {
      error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.discountPrice || item.product.price,
        })),
        shippingAddress: address,
        paymentMethod,
        totalAmount: total,
      };

      await post("/orders", orderData);
      success("Order placed successfully!");
      clearCart();
      setTimeout(() => router.push("/orders"), 2000);
    } catch (err) {
      error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <Link href="/shop" className="text-blue-600 hover:text-blue-700">
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {/* Step Indicator */}
            <div className="flex gap-4 mb-8">
              {[
                { num: 1, title: "Shipping" },
                { num: 2, title: "Payment" },
                { num: 3, title: "Confirm" },
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.num
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.num}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      currentStep >= step.num
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.num < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step.num ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Full Name*"
                      value={address.name}
                      onChange={(e) =>
                        handleAddressChange("name", e.target.value)
                      }
                      fullWidth
                    />
                    <Input
                      label="Email*"
                      type="email"
                      value={address.email}
                      onChange={(e) =>
                        handleAddressChange("email", e.target.value)
                      }
                      fullWidth
                    />
                  </div>

                  <Input
                    label="Phone Number*"
                    value={address.phone}
                    onChange={(e) =>
                      handleAddressChange("phone", e.target.value)
                    }
                    fullWidth
                  />

                  <Input
                    label="Street Address*"
                    value={address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    fullWidth
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City*"
                      value={address.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      fullWidth
                    />
                    <Input
                      label="State*"
                      value={address.state}
                      onChange={(e) =>
                        handleAddressChange("state", e.target.value)
                      }
                      fullWidth
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ZIP Code*"
                      value={address.zip}
                      onChange={(e) =>
                        handleAddressChange("zip", e.target.value)
                      }
                      fullWidth
                    />
                    <Input
                      label="Country"
                      value={address.country}
                      disabled
                      fullWidth
                    />
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  className="mt-6"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue to Payment
                </Button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payment Method
                </h2>

                <div className="space-y-4">
                  {[
                    { value: "card", label: "Credit/Debit Card", icon: "💳" },
                    { value: "upi", label: "UPI", icon: "📱" },
                    { value: "wallet", label: "Digital Wallet", icon: "👛" },
                    { value: "cod", label: "Cash on Delivery", icon: "🚚" },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as
                              | "card"
                              | "upi"
                              | "wallet"
                              | "cod"
                          )
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-2xl ml-4">{method.icon}</span>
                      <span className="ml-4 font-semibold text-gray-900">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setCurrentStep(3)}
                  >
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm Order */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Confirm Your Order
                </h2>

                <div className="space-y-6">
                  {/* Address Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Shipping Address
                    </h3>
                    <p className="text-gray-600">
                      {address.name}
                      <br />
                      {address.street}
                      <br />
                      {address.city}, {address.state} {address.zip}
                      <br />
                      {address.country}
                      <br />
                      {address.phone}
                    </p>
                  </div>

                  {/* Payment Method Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Payment Method
                    </h3>
                    <p className="text-gray-600">
                      {paymentMethod.toUpperCase()}
                    </p>
                  </div>

                  {/* Items Summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between text-gray-600"
                        >
                          <span>
                            {item.product.name} × {item.quantity}
                          </span>
                          <span>
                            {formatPrice(
                              (item.product.discountPrice ||
                                item.product.price) * item.quantity
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setCurrentStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={loading}
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-6 max-h-96 overflow-y-auto mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(
                        (item.product.discountPrice ||
                          item.product.price) * item.quantity
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 bg-blue-50 p-4 rounded-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

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