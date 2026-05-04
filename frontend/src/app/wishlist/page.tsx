"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types";
import { apiFetch } from "@/lib/api";
import { logger } from "@/lib/logger";
import ProductCard from "@/components/ui/ProductCard";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlistIds, loading: contextLoading } = useWishlist();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiFetch<{ results?: { products?: Product[] }[] }>("/catalog/wishlist/")
        .then((data) => {
          setProducts(data.results?.[0]?.products || []);
        })
        .catch((err) => logger.error("Failed to load wishlist", err, { component: "WishlistPage" }))
        .finally(() => setLoading(false));
    }
  }, [user, wishlistIds]); // Re-fetch when wishlistIds change to keep in sync

  if (loading || contextLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
          Retrieving Collection...
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-zinc-700" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic mb-4">Empty Collection</h1>
          <p className="text-zinc-500 mb-12">You have not saved any artifacts to your personal archive yet.</p>
          <Link 
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-luxury-gold transition-colors"
          >
            Explore Archive <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic mb-4">Wishlist</h1>
            <p className="text-zinc-500 font-medium">Your curated selection of {products.length} artifacts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
