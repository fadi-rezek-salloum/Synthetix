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
}
