"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Cart } from "@/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  addToCart: (variantId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch<Cart | { results?: Cart[] }>("/orders/cart/");
      const paginatedCart = data as { results?: Cart[] };
      setCart(Array.isArray(paginatedCart.results) ? paginatedCart.results[0] || null : data as Cart);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }, [user]);

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };

    if (user) {
      void loadCart();
    } else {
      window.setTimeout(() => setCart(null), 0);
    }
  }, [fetchCart, user]);

  const addToCart = async (variantId: number, quantity: number = 1) => {
    if (!user) return;
    try {
      const updatedCart = await apiFetch<Cart>("/orders/cart/add_item/", {
        method: "POST",
        body: JSON.stringify({ variant_id: variantId, quantity }),
      });
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!user) return;
    try {
      // Assuming a standard delete on CartItem endpoint
      // For now, let's just refetch or implement a specific cart-remove action
      await apiFetch(`/orders/cart/remove_item/`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId }),
      });
      await fetchCart();
    } catch (err) {
      console.error("Failed to remove from cart:", err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
