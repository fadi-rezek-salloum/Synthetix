"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { productService } from "@/services/productService";
import Navbar from "@/components/layout/navbar";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";
import ProductGallery from "@/components/ui/ProductGallery";

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      productService
        .getProductBySlug(slug as string)
        .then(setProduct)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Analyzing Identity...
      </div>
    );
  if (!product)
    return (
      <div className="h-screen flex items-center justify-center">
        Product Not Found
      </div>
    );

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
        <ProductGallery images={product.images} />

        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-luxury-gold tracking-[0.3em] uppercase text-xs mb-4 block">
              {product.brand}
            </span>
            <h1 className="text-5xl font-bold tracking-tighter mb-6">
              {product.name}
            </h1>
            <p className="text-3xl font-light mb-10">${product.base_price}</p>

            {/* AI Insight Box */}
            <div className="glass p-8 rounded-3xl mb-10 border-indigo-500/20">
              <div className="flex items-center gap-2 text-indigo-400 mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  AI Identity Insight
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed italic">
                "{product.ai_description}"
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {product.ai_style_tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-zinc-400 uppercase tracking-tighter"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full py-5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all mb-4">
              Add to Identity Collection
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ProductPage;
