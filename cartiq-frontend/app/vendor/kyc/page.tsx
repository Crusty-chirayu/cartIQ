"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/hooks/useNotification";
import { Button, Input, Loader } from "@/components/ui";
import Footer from "@/components/Footer";

interface KYCData {
  businessName: string;
  businessType: "individual" | "partnership" | "pvt_ltd" | "llp";
  panNumber: string;
  gstNumber?: string;
  registrationNumber?: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  documents: Array<{
    type: string;
    url: string;
  }>;
}

export default function VendorKYCPage() {
  const { get, post, patch } = useApi();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string>("not_submitted");
  const [formData, setFormData] = useState<KYCData>({
    businessName: user?.name || "",
    businessType: "individual",
    panNumber: "",
    gstNumber: "",
    registrationNumber: "",
    businessAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    documents: [{ type: "pan_card", url: "" }],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "seller") return;

    const fetchKYCStatus = async () => {
      try {
        const response = await get("/vendor/kyc-status", { showToast: false });
        if (response?.data) {
          setKycStatus(response.data.status);
          if (response.data.status !== "not_submitted") {
            setFormData(response.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch KYC status:", err);
      }
    };

    fetchKYCStatus();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "seller") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only sellers can access this page</p>
        </div>
      </main>
    );
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
    if (!formData.panNumber.trim()) newErrors.panNumber = "PAN number is required";
    if (!formData.businessAddress.street.trim()) newErrors.street = "Street is required";
    if (!formData.businessAddress.city.trim()) newErrors.city = "City is required";
    if (!formData.businessAddress.state.trim()) newErrors.state = "State is required";
    if (!formData.businessAddress.pincode.trim()) newErrors.pincode = "Pincode is required";

    if (formData.documents.some((d) => !d.url)) {
      newErrors.documents = "All document URLs are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await post("/vendor/kyc", formData);
      success("KYC submitted successfully! Admin will review soon.");
      setKycStatus("pending");
    } catch (err) {
      error("Failed to submit KYC. Please try again.");
      console.error("KYC submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, { type: "", url: "" }],
    }));
  };

  const handleRemoveDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const newDocs = [...prev.documents];
      newDocs[index] = { ...newDocs[index], [field]: value };
      return { ...prev, documents: newDocs };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 KYC Verification</h1>
          <p className="text-gray-600">Complete your Know Your Customer verification to unlock seller features</p>
        </div>

        {/* Status Badge */}
        <div className={`rounded-lg p-4 mb-8 border-2 ${getStatusColor(kycStatus)}`}>
          <h3 className="font-bold mb-1 capitalize">Status: {kycStatus.replace("_", " ")}</h3>
          {kycStatus === "verified" && (
            <p>✅ Your KYC has been approved! You can now sell without restrictions.</p>
          )}
          {kycStatus === "rejected" && (
            <p>❌ Your KYC was rejected. Please submit again with correct documents.</p>
          )}
          {kycStatus === "pending" && (
            <p>⏳ Your KYC is under review. We'll notify you soon.</p>
          )}
          {kycStatus === "not_submitted" && (
            <p>📝 Please submit your KYC details below to get started.</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Business Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Information</h2>

            <div className="space-y-4">
              <Input
                label="Business Name *"
                value={formData.businessName}
                onChange={(e) => {
                  setFormData({ ...formData, businessName: e.target.value });
                  setErrors({ ...errors, businessName: "" });
                }}
                error={errors.businessName}
                fullWidth
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessType: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="individual">Individual</option>
                  <option value="partnership">Partnership</option>
                  <option value="pvt_ltd">Pvt Ltd</option>
                  <option value="llp">LLP</option>
                </select>
              </div>

              <Input
                label="PAN Number *"
                placeholder="ABCDE1234F"
                value={formData.panNumber}
                onChange={(e) => {
                  setFormData({ ...formData, panNumber: e.target.value });
                  setErrors({ ...errors, panNumber: "" });
                }}
                error={errors.panNumber}
                fullWidth
              />

              <Input
                label="GST Number"
                placeholder="18AABCT1234ABC1Z5"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                fullWidth
              />

              <Input
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                fullWidth
              />
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Address</h2>

            <div className="space-y-4">
              <Input
                label="Street Address *"
                value={formData.businessAddress.street}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    businessAddress: { ...formData.businessAddress, street: e.target.value },
                  });
                  setErrors({ ...errors, street: "" });
                }}
                error={errors.street}
                fullWidth
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City *"
                  value={formData.businessAddress.city}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      businessAddress: { ...formData.businessAddress, city: e.target.value },
                    });
                    setErrors({ ...errors, city: "" });
                  }}
                  error={errors.city}
                  fullWidth
                />

                <Input
                  label="State *"
                  value={formData.businessAddress.state}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      businessAddress: { ...formData.businessAddress, state: e.target.value },
                    });
                    setErrors({ ...errors, state: "" });
                  }}
                  error={errors.state}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Pincode *"
                  value={formData.businessAddress.pincode}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      businessAddress: { ...formData.businessAddress, pincode: e.target.value },
                    });
                    setErrors({ ...errors, pincode: "" });
                  }}
                  error={errors.pincode}
                  fullWidth
                />

                <Input
                  label="Country"
                  value={formData.businessAddress.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessAddress: { ...formData.businessAddress, country: e.target.value },
                    })
                  }
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Documents *</h2>
            <p className="text-gray-600 text-sm mb-4">Upload clear images or PDFs of your verification documents</p>

            <div className="space-y-4">
              {formData.documents.map((doc, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <select
                    value={doc.type}
                    onChange={(e) => handleDocumentChange(idx, "type", e.target.value)}
                    className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="">Select document type</option>
                    <option value="pan_card">PAN Card</option>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="gst_certificate">GST Certificate</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="business_license">Business License</option>
                    <option value="other">Other</option>
                  </select>

                  <Input
                    label={idx === 0 ? "Document URL" : ""}
                    placeholder="https://example.com/document.pdf"
                    value={doc.url}
                    onChange={(e) => handleDocumentChange(idx, "url", e.target.value)}
                    fullWidth
                  />

                  {formData.documents.length > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveDocument(idx)}
                      type="button"
                    >
                      ❌
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {errors.documents && (
              <p className="text-red-500 text-sm mt-2">{errors.documents}</p>
            )}

            <Button
              variant="outline"
              onClick={handleAddDocument}
              type="button"
              className="mt-4"
            >
              + Add Another Document
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            type="submit"
            disabled={kycStatus === "verified" || kycStatus === "pending"}
          >
            {kycStatus === "verified"
              ? "✅ Already Verified"
              : kycStatus === "pending"
              ? "⏳ Under Review"
              : "📤 Submit KYC"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By submitting, you agree to CartIQ's verification policies and terms.
          </p>
        </form>
      </div>

      <Footer />
    </main>
  );
}
