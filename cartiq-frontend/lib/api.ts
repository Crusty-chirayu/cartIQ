import axios, { AxiosInstance, AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    // Safe localStorage access for client-side only
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && typeof window !== "undefined") {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { token } = response.data.data;
        localStorage.setItem("token", token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (err) {
        if (typeof window !== "undefined") {
          localStorage.clear();
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) =>
    apiClient.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),
  logout: () =>
    apiClient.post("/auth/logout"),
  refreshToken: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),
  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify-email/${token}`),
  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),
  loginWithGoogle: (code: string) =>
    apiClient.post("/auth/login/google", { code }),
};

// Products API
export const productsApi = {
  getAll: (params?: any) =>
    apiClient.get("/products", { params }),
  getBySlug: (slug: string) =>
    apiClient.get(`/products/${slug}`),
  search: (query: string, params?: any) =>
    apiClient.get("/products/search", {
      params: { q: query, ...params },
    }),
  getFeatured: () =>
    apiClient.get("/products/featured"),
  getTrending: () =>
    apiClient.get("/products/trending"),
  create: (data: FormData) =>
    apiClient.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: FormData) =>
    apiClient.patch(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),
  uploadImages: (id: string, formData: FormData) =>
    apiClient.post(`/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Cart API
export const cartApi = {
  get: () => apiClient.get("/cart"),
  addItem: (data: {
    productId: string;
    variantId?: string;
    quantity: number;
  }) => apiClient.post("/cart/items", data),
  updateItem: (itemId: string, quantity: number) =>
    apiClient.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) =>
    apiClient.delete(`/cart/items/${itemId}`),
  clear: () => apiClient.delete("/cart"),
  validate: () => apiClient.post("/cart/validate"),
  getSuggestions: () =>
    apiClient.get("/cart/suggestions"),
};

// Orders API
export const ordersApi = {
  create: (data: any) => apiClient.post("/orders", data),
  getAll: (params?: any) =>
    apiClient.get("/orders", { params }),
  getOne: (id: string) =>
    apiClient.get(`/orders/${id}`),
  cancel: (id: string, reason: string) =>
    apiClient.patch(`/orders/${id}/cancel`, { reason }),
  track: (id: string) =>
    apiClient.get(`/orders/${id}/track`),
};

// Wishlist API
export const wishlistApi = {
  get: () =>
    apiClient.get("/wishlist"),
  add: (productId: string) =>
    apiClient.post("/wishlist", { productId }),
  remove: (productId: string) =>
    apiClient.delete("/wishlist", { data: { productId } }),
  toggle: (productId: string) =>
    apiClient.post("/wishlist/toggle", { productId }),
  clear: () =>
    apiClient.delete("/wishlist/clear"),
  check: (productId: string) =>
    apiClient.get("/wishlist/check", { params: { productId } }),
};

// Reviews API
export const reviewsApi = {
  create: (data: {
    productId: string;
    orderId: string;
    rating: number;
    title: string;
    comment?: string;
    images?: string[];
  }) =>
    apiClient.post("/reviews", data),
  getByProduct: (productId: string, params?: any) =>
    apiClient.get(`/reviews/products/${productId}`, { params }),
  getSummary: (productId: string) =>
    apiClient.get(`/reviews/products/${productId}/summary`),
  update: (id: string, data: any) =>
    apiClient.patch(`/reviews/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/reviews/${id}`),
  markHelpful: (id: string) =>
    apiClient.patch(`/reviews/${id}/helpful`),
};

// AI API
export const aiApi = {
  chat: (data: {
    message: string;
    conversationId?: string;
  }) => apiClient.post("/ai/chat", data),
  getConversation: (id: string) =>
    apiClient.get(`/ai/conversations/${id}`),
  clearConversation: (id: string) =>
    apiClient.delete(`/ai/conversations/${id}`),
  generateDescription: (data: any) =>
    apiClient.post("/ai/generate/description", data),
  generateTags: (data: any) =>
    apiClient.post("/ai/generate/tags", data),
  getRecommendations: (params?: any) =>
    apiClient.get("/ai/recommend", { params }),
  semanticSearch: (query: string) =>
    apiClient.post("/ai/search/semantic", { query }),
  suggestPricing: (data: any) =>
    apiClient.post("/ai/pricing/suggest", data),
};

// Payments API
export const paymentsApi = {
  initiate: (data: {
    orderId: string;
    method: "stripe" | "razorpay" | "wallet" | "cod";
  }) => apiClient.post("/payments/initiate", data),
  verify: (data: any) =>
    apiClient.post("/payments/verify", data),
  getTransactions: (params?: any) =>
    apiClient.get("/payments/transactions", { params }),
};

// Support API
export const supportApi = {
  createTicket: (data: any) =>
    apiClient.post("/support/tickets", data),
  getTickets: (params?: any) =>
    apiClient.get("/support/tickets", { params }),
  getTicket: (id: string) =>
    apiClient.get(`/support/tickets/${id}`),
  addMessage: (id: string, content: string) =>
    apiClient.post(`/support/tickets/${id}/messages`, {
      content,
    }),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/support/tickets/${id}/status`, {
      status,
    }),
  escalate: (id: string) =>
    apiClient.post(`/support/tickets/${id}/escalate`),
};

// Vendor API
export const vendorApi = {
  getProfile: () =>
    apiClient.get("/vendor/profile"),
  updateProfile: (data: any) =>
    apiClient.patch("/vendor/profile", data),
  submitKYC: (data: FormData) =>
    apiClient.post("/vendor/kyc", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAnalytics: (params?: any) =>
    apiClient.get("/vendor/analytics", { params }),
  getAnalyticsChart: (params?: any) =>
    apiClient.get("/vendor/analytics/chart", { params }),
  getPayouts: (params?: any) =>
    apiClient.get("/vendor/payouts", { params }),
  requestPayout: (data: any) =>
    apiClient.post("/vendor/payouts/request", data),
};

// Admin API
export const adminApi = {
  getUsers: (params?: any) =>
    apiClient.get("/admin/users", { params }),
  banUser: (id: string) =>
    apiClient.patch(`/admin/users/${id}/ban`),
  getSellers: (params?: any) =>
    apiClient.get("/admin/sellers", { params }),
  approveKYC: (id: string, data: any) =>
    apiClient.patch(`/admin/kyc/${id}/approve`, data),
  rejectKYC: (id: string, reason: string) =>
    apiClient.patch(`/admin/kyc/${id}/reject`, { reason }),
  getProducts: (params?: any) =>
    apiClient.get("/admin/products", { params }),
  verifyProduct: (id: string, status: string) =>
    apiClient.patch(`/admin/products/${id}/verify`, {
      status,
    }),
  getAnalytics: () =>
    apiClient.get("/admin/analytics"),
};

export default apiClient;