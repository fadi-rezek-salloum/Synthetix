"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types";
import { apiFetch } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistIds: number[];
  toggleWishlist: (productId: number) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<{ results?: { products?: Product[] }[] }>(
          "/catalog/wishlist/",
        );
        const products = data.results?.[0]?.products || [];
        setWishlistIds(products.map((p) => p.id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      void loadWishlist();
    } else {
      window.setTimeout(() => setWishlistIds([]), 0);
    }
  }, [user]);

  const toggleWishlist = async (productId: number) => {
    if (!user) return;
    
    try {
      const res = await apiFetch<{ status: "added" | "removed" }>(
        "/catalog/wishlist/toggle/",
        {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
        },
      );
      
      if (res.status === "added") {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
