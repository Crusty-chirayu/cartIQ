"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { useNotification } from "@/hooks/useNotification";
import { Button, Input } from "@/components/ui";

export default function AddProductPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { post, loading } = useApi();
  const { success, error } = useNotification();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [] as string[],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = "Valid stock is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        images: formData.images,
      };

      await post("/products", productData);
      success("Product added successfully!");
      router.push("/vendor/dashboard");
    } catch (err: any) {
      error(err.response?.data?.message || "Failed to add product");
      console.error("Product error:", err);
    }
  };

  if (!isAuthenticated || user?.role !== "seller") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p>Only sellers can add products</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4 animate-fadeInUp">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Add New Product</h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Product Title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              error={errors.title}
              fullWidth
              placeholder="e.g., Premium Wireless Headphones"
            />

            <div>
              <label className="mb-2 text-sm font-medium text-gray-700 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-400 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Describe your product in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                error={errors.price}
                fullWidth
                placeholder="0.00"
              />

              <Input
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                error={errors.stock}
                fullWidth
                placeholder="0"
              />
            </div>

            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              error={errors.category}
              fullWidth
              placeholder="e.g., Electronics"
            />

            <div>
              <label className="mb-2 text-sm font-medium text-gray-700 block">Image URLs (comma separated)</label>
              <textarea
                value={formData.images.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images: e.target.value.split(",").map((url) => url.trim()),
                  })
                }
                className="w-full px-4 py-3 text-gray-900 font-medium border-2 border-gray-400 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <div className="flex gap-4">
              <Button variant="primary" type="submit" fullWidth size="lg" loading={loading}>
                ✅ Add Product
              </Button>
              <Button
                variant="outline"
                type="button"
                fullWidth
                size="lg"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips for Better Sales:</h3>
          <ul className="text-blue-800 space-y-1">
            <li>✓ Write clear, detailed descriptions</li>
            <li>✓ Use high-quality product images</li>
            <li>✓ Set competitive prices</li>
            <li>✓ Keep stock updated regularly</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
