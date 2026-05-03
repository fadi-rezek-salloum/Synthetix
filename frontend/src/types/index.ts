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
  role: "customer" | "seller";
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
  last_name?: string;
  role: "customer" | "seller";
}
