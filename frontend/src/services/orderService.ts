import { apiFetch } from "@/lib/api";
import { Order, PaginatedResponse } from "@/types";

export const orderService = {
  getOrders: async (): Promise<PaginatedResponse<Order>> => {
    return await apiFetch<PaginatedResponse<Order>>("/orders/orders/");
  },

  checkout: async (shippingAddress: string): Promise<Order> => {
    return await apiFetch<Order>("/orders/orders/checkout/", {
      method: "POST",
      body: JSON.stringify({ shipping_address: shippingAddress }),
    });
  },
};
