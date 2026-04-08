// User & Auth
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Product
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  seller: {
    _id: string;
    name: string;
    avatar?: string;
  };
  variants?: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface Variant {
  _id: string;
  name: string;
  value: string;
  price?: number;
  stock?: number;
}

// Cart
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  variant?: string;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Order
export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: "upi" | "card" | "wallet" | "cod";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  discount?: number;
  shippingCost: number;
  couponCode?: string;
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: string;
}

export interface Address {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

// Review
export interface Review {
  _id: string;
  product: string;
  user: User;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

// Wishlist
export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

// Category
export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

// AI
export interface AIMessage {
  _id: string;
  user: string;
  question: string;
  reply: string;
  products: Product[];
  intent: string;
  createdAt: string;
}

export interface AIConversation {
  _id: string;
  user: string;
  messages: AIMessage[];
  createdAt: string;
}

// Pagination
export interface PaginationMeta {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// AI Chat Response (special format)
export interface AIChatResponse {
  reply: string;
  products: Product[];
  intent: string;
  conversationId: string;
}

// Support
export interface SupportTicket {
  _id: string;
  user: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  _id: string;
  ticket: string;
  sender: User;
  message: string;
  attachments?: string[];
  createdAt: string;
}

// Seller
export interface SellerProfile {
  _id: string;
  user: string;
  storeName: string;
  storeDescription: string;
  logo?: string;
  banner?: string;
  rating: number;
  totalProducts: number;
  totalOrders: number;
  kycStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Notification
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: "order" | "product" | "promotion" | "support";
  read: boolean;
  link?: string;
  createdAt: string;
}
