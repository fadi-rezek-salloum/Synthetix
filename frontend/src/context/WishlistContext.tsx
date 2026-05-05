"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types";
import { wishlistService } from "@/services/wishlistService";
import { logger } from "@/lib/logger";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistIds: number[];
  toggleWishlist: (productId: number) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        const products = await wishlistService.getWishlist();
        setWishlistIds(products.map((p) => p.id));
      } catch (error) {
        logger.error("Failed to load wishlist", error, {
          component: "WishlistContext",
        });
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
      const res = await wishlistService.toggle(productId);

      if (res.status === "added") {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
    } catch (err) {
      logger.error("Failed to toggle wishlist", err, {
        component: "WishlistContext",
        productId,
      });
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
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
