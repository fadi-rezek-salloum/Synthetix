"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Cart } from "@/types";
import { cartService } from "@/services/cartService";
import { logger } from "@/lib/logger";
import NotificationService from "@/lib/notificationService";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: Cart | null;
  addToCart: (variantId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
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
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      logger.error("Failed to fetch cart", err, { component: "CartContext" });
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
      const updatedCart = await cartService.addItem(variantId, quantity);
      setCart(updatedCart);
      NotificationService.success("Item added to cart");
    } catch (err: unknown) {
      const errorMsg = (err as Record<string, string>)?.error || "Failed to add item to cart";
      logger.error("Failed to add to cart", err, { component: "CartContext", variantId, quantity });
      NotificationService.error(errorMsg);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!user) return;
    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
      NotificationService.success("Item removed from cart");
    } catch (err) {
      logger.error("Failed to remove from cart", err, { component: "CartContext", itemId });
      NotificationService.error("Failed to remove item from cart");
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!user) return;
    try {
      const updatedCart = await cartService.updateQuantity(itemId, quantity);
      setCart(updatedCart);
    } catch (err: unknown) {
      const errorMsg = (err as Record<string, string>)?.error || "Failed to update quantity";
      logger.error("Failed to update quantity", err, { component: "CartContext", itemId, quantity });
      NotificationService.error(errorMsg);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
