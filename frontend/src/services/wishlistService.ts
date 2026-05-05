import { apiFetch } from "@/lib/api";
import { Product } from "@/types";

export interface WishlistResponse {
  results?: { products?: Product[] }[];
  status?: "added" | "removed";
  count?: number;
}

export const wishlistService = {
  getWishlist: async () => {
    const data = await apiFetch<WishlistResponse>("/catalog/wishlist/");
    return data.results?.[0]?.products || [];
  },

  toggle: async (productId: number) => {
    return await apiFetch<{ status: "added" | "removed"; count: number }>(
      "/catalog/wishlist/toggle/",
      {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      }
    );
  },
};
