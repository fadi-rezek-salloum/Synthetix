import { apiFetch } from "@/lib/api";
import { Category, PaginatedResponse } from "@/types";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiFetch<Category[] | PaginatedResponse<Category>>(
      "/catalog/categories/",
    );
    // DRF router usually returns results if paginated, but list views for categories might be simple arrays
    return Array.isArray(response) ? response : response.results;
  },
};
