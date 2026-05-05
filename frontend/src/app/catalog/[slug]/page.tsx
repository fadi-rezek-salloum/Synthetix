"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Product, ProductVariant } from "@/types";
import { productService } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import NotificationService from "@/lib/notificationService";
import { Sparkles } from "lucide-react";
import ProductGallery from "@/components/ui/ProductGallery";

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (slug) {
      productService
        .getProductBySlug(slug as string)
        .then((data) => {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        })
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
                &quot;{product.ai_description}&quot;
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

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-10">
                <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4">Select Variant</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock <= 0}
                      className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest border transition-all ${
                        selectedVariant?.id === variant.id
                          ? "bg-white text-black border-white"
                          : "bg-transparent text-zinc-400 border-white/20 hover:border-white/50"
                      } ${variant.stock <= 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {variant.size} / {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => {
                if (!selectedVariant) {
                  NotificationService.error("Please select a variant.");
                  return;
                }
                if (selectedVariant.stock <= 0) {
                  NotificationService.error("This variant is out of stock.");
                  return;
                }
                addToCart(selectedVariant.id, 1);
              }}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              className="w-full py-5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Identity Collection"}
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ProductPage;
