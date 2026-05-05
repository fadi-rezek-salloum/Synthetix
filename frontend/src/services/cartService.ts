import { apiFetch } from "@/lib/api";
import { Cart } from "@/types";

export const cartService = {
  getCart: async (): Promise<Cart | null> => {
    const data = await apiFetch<Cart | { results?: Cart[] }>("/orders/cart/");
    const paged = data as { results?: Cart[] };
    return Array.isArray(paged.results) ? paged.results[0] || null : data as Cart;
  },

  addItem: async (variantId: number, quantity: number = 1): Promise<Cart> => {
    return await apiFetch<Cart>("/orders/cart/add_item/", {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    });
  },

  removeItem: async (itemId: number): Promise<Cart> => {
    return await apiFetch<Cart>("/orders/cart/remove_item/", {
      method: "POST",
      body: JSON.stringify({ item_id: itemId }),
    });
  },

  updateQuantity: async (itemId: number, quantity: number): Promise<Cart> => {
    return await apiFetch<Cart>("/orders/cart/update_quantity/", {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, quantity }),
    });
  },
};
