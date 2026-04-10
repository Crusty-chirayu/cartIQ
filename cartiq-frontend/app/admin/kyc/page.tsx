"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { Badge, Button, Loader } from "@/components/ui";
import Footer from "@/components/Footer";

interface KYCRequest {
  _id: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  status: "pending" | "verified" | "rejected";
  documentType: string;
  documentNumber: string;
  documentImage: string;
  submittedAt: string;
  verifiedAt?: string;
  expiresAt?: string;
}

export default function AdminKYCPage() {
  const { get, patch } = useApi();
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("pending");

  useEffect(() => {
    const fetchKYCRequests = async () => {
      try {
        let query = "/admin/kyc";
        if (filter !== "all") {
          query += `?status=${filter}`;
        }
        const response = await get(query, { showToast: false });
        setKycRequests(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch KYC requests:", err);
        error("Failed to load KYC requests");
      } finally {
        setLoading(false);
      }
    };

    fetchKYCRequests();
  }, [filter]);

  const handleApproveKYC = async (kycId: string) => {
    try {
      await patch(`/admin/kyc/${kycId}/approve`, {});
      setKycRequests((prev) =>
        prev.map((k) =>
          k._id === kycId ? { ...k, status: "verified" } : k
        )
      );
      success("KYC approved successfully");
    } catch (err) {
      console.error("Failed to approve KYC:", err);
      error("Failed to approve KYC");
    }
  };

  const handleRejectKYC = async (kycId: string) => {
    try {
      await patch(`/admin/kyc/${kycId}/reject`, {});
      setKycRequests((prev) =>
        prev.map((k) =>
          k._id === kycId ? { ...k, status: "rejected" } : k
        )
      );
      success("KYC rejected");
    } catch (err) {
      console.error("Failed to reject KYC:", err);
      error("Failed to reject KYC");
    }
  };

  // Ensure user is admin
  if (user?.role !== "admin") {
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

  if (loading) return <Loader fullScreen />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const pendingCount = kycRequests.filter(k => k.status === "pending").length;
  const verifiedCount = kycRequests.filter(k => k.status === "verified").length;
  const rejectedCount = kycRequests.filter(k => k.status === "rejected").length;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎯 KYC Verification</h1>
          <p className="text-gray-600">Approve or reject seller KYC documents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending Verification</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-400">
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-400">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-2">
          {(["all", "pending", "verified", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* KYC Requests */}
        <div className="space-y-4">
          {kycRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No KYC requests found</p>
            </div>
          ) : (
            kycRequests.map((kyc) => (
              <div
                key={kyc._id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  {/* Left Side */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {kyc.seller.name}
                      </h3>
                      <Badge className={getStatusColor(kyc.status)}>
                        {kyc.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{kyc.seller.email}</p>

                    {/* KYC Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Document Type:</span>
                        <p className="font-medium text-gray-900">{kyc.documentType}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Document Number:</span>
                        <p className="font-medium text-gray-900">{kyc.documentNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(kyc.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Document Preview */}
                    {kyc.documentImage && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Document Image:</p>
                        <a
                          href={kyc.documentImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          📄 View Document
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {kyc.status === "pending" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveKYC(kyc._id)}
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectKYC(kyc._id)}
                        >
                          ❌ Reject
                        </Button>
                      </>
                    )}
                    {kyc.status === "verified" && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded text-sm font-medium text-center">
                        ✓ Verified
                      </div>
                    )}
                    {kyc.status === "rejected" && (
                      <div className="px-4 py-2 bg-red-100 text-red-700 rounded text-sm font-medium text-center">
                        ✗ Rejected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
