import { apiFetch } from "@/lib/api";
import { Product } from "@/types";

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await apiFetch("/catalog/products/");
    console.log(response);
    return response.results || response;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await apiFetch(`/catalog/products/${slug}/`);
    return response.results || response;
  },
};
