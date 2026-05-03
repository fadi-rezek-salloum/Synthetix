import { apiFetch } from "@/lib/api";
import { PaginatedResponse, Product } from "@/types";

export const productService = {
  getProducts: async (params: {
    page?: number;
    category?: string;
    brand?: string;
    gender?: string;
    is_featured?: boolean;
    min_price?: number;
    max_price?: number;
    ordering?: string;
  } = {}): Promise<PaginatedResponse<Product>> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.category) queryParams.set("category__slug", params.category);
    if (params.brand) queryParams.set("brand", params.brand);
    if (params.gender) queryParams.set("gender", params.gender);
    if (params.is_featured !== undefined)
      queryParams.set("is_featured", params.is_featured.toString());
    if (params.min_price) queryParams.set("min_price", params.min_price.toString());
    if (params.max_price) queryParams.set("max_price", params.max_price.toString());
    if (params.ordering) queryParams.set("ordering", params.ordering);

    const response = await apiFetch<PaginatedResponse<Product>>(
      `/catalog/products/?${queryParams.toString()}`,
    );
    return response;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await apiFetch<Product>(`/catalog/products/${slug}/`);
    return response;
  },
};
