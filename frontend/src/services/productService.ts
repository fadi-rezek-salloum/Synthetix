import { apiFetch } from "@/lib/api";
import { PaginatedResponse, Product } from "@/types";

export const productService = {
  getProducts: async (
    page = 1,
    category?: string,
  ): Promise<PaginatedResponse<Product>> => {
    let url = `/catalog/products/?page=${page}`;
    if (category) url += `&category__slug=${category}`;
    const response = await apiFetch(url);
    return response;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await apiFetch(`/catalog/products/${slug}/`);
    return response;
  },
};
