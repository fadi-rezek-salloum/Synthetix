import { apiFetch } from "@/lib/api";

export interface ChatReply {
  reply: string;
}

export const intelligenceService = {
  chat: async (message: string) => {
    return await apiFetch<ChatReply>("/intelligence/chat/buyer/", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  enrichProduct: async (productId: number) => {
    return await apiFetch("/intelligence/vendor/enrich/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    });
  },
};
