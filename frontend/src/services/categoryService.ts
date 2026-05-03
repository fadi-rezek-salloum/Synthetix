import { apiFetch } from "@/lib/api";
import { Category } from "@/types";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiFetch("/catalog/categories/");
    // DRF router usually returns results if paginated, but list views for categories might be simple arrays
    return response.results || response;
  },
};
