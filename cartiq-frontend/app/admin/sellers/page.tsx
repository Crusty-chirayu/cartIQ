"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { SellerProfile } from "@/types";
import { Badge, Button, Loader } from "@/components/ui";
import Footer from "@/components/Footer";

export default function AdminSellersPage() {
  const { get, patch } = useApi();
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await get("/admin/sellers", { showToast: false });
        setSellers(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch sellers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  const handleApproveKYC = async (sellerId: string) => {
    try {
      await patch(`/admin/sellers/${sellerId}/approve-kyc`, {});
      setSellers((prev) =>
        prev.map((s) =>
          s._id === sellerId ? { ...s, kycStatus: "approved" } : s
        )
      );
    } catch (err) {
      console.error("Failed to approve KYC:", err);
    }
  };

  const handleRejectKYC = async (sellerId: string) => {
    try {
      await patch(`/admin/sellers/${sellerId}/reject-kyc`, {});
      setSellers((prev) =>
        prev.map((s) =>
          s._id === sellerId ? { ...s, kycStatus: "rejected" } : s
        )
      );
    } catch (err) {
      console.error("Failed to reject KYC");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Verification</h1>

        <div className="space-y-4">
          {sellers.map((seller) => (
            <div key={seller._id} className="bg-white rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {seller.storeName}
                  </h3>
                  <p className="text-gray-600">{seller.storeDescription}</p>
                  <div className="flex gap-4 mt-4">
                    <span className="text-sm text-gray-600">
                      Products: {seller.totalProducts}
                    </span>
                    <span className="text-sm text-gray-600">
                      Orders: {seller.totalOrders}
                    </span>
                    <span className="text-sm text-gray-600">
                      Rating: {seller.rating}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant={
                      seller.kycStatus === "approved"
                        ? "success"
                        : seller.kycStatus === "rejected"
                        ? "danger"
                        : "warning"
                    }
                    className="mb-4"
                  >
                    {seller.kycStatus}
                  </Badge>

                  {seller.kycStatus === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveKYC(seller._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectKYC(seller._id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
