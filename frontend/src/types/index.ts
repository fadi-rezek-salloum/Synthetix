// ─── Shared API helpers ───────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Catalog ─────────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  image: string;
  is_feature: boolean;
  alt_text: string;
}

export interface ProductVariant {
  id: number;
  product?: Product;
  size: string;
  color: string;
  stock: number;
  price_override: string | null;
  sku?: string | null;
}

export interface Review {
  id: number;
  product: number;
  user: number;
  user_email: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface PriceHistory {
  id: number;
  price: string;
  recorded_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  gender: "M" | "W" | "U";
  description: string;
  base_price: string;
  discount_price: string | null;
  category: number;
  category_name: string;
  is_featured: boolean;
  is_active?: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  price_history?: PriceHistory[];
  ai_description?: string;
  ai_style_tags?: string[];
}

// ─── Accounts ────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  username?: string;
  first_name: string;
  last_name?: string;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  phone_number?: string;
  avatar?: string;
  logo?: string;
  addresses?: Address[];
}

export interface Address {
  id: number;
  address_type: "SHIPPING" | "BILLING";
  first_name: string;
  last_name: string;
  street_address: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface CustomerProfile {
  id: number;
  avatar: string | null;
  shipping_address: string;
  preferred_size_top: string;
  preferred_size_bottom: string;
  ai_style_preferences: string[];
}

export interface SellerProfile {
  id: number;
  store_name: string;
  store_logo: string | null;
  description: string;
  tax_id: string;
  is_verified: boolean;
  created_at: string;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface Wishlist {
  id: number;
  products: Product[];
  updated_at: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number;
  variant: ProductVariant & { product: Product };
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  updated_at: string;
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: number;
  product: Product;
  variant_info: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total_amount: string;
  shipping_address: string;
  tracking_number: string | null;
  items: OrderItem[];
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  username?: string;
  password1?: string;
  password2?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar?: File | null;
  logo?: File | null;
  store_name?: string;
  role: "CUSTOMER" | "SELLER";
}

// ─── Intelligence ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
