export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
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
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  base_price: string;
  discount_price: string | null;
  category_name: string;
  images: ProductImage[];
  variants: ProductVariant[];
  ai_description?: string;
  ai_style_tags?: string[];
}

export interface User {
  id: number;
  email: string;
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
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface Wishlist {
  id: number;
  products: Product[];
  updated_at: string;
}

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
  // Profile Media
  avatar?: File | null;
  logo?: File | null;
  // Seller Profile Fields
  store_name?: string;
  role: "CUSTOMER" | "SELLER";
}
