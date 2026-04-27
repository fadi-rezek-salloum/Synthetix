"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
}

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] glass rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-700">
        No Visuals Available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-[3/4] glass rounded-3xl overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex].image}
              alt={images[activeIndex].alt_text || "Product Image"}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative w-20 aspect-square rounded-xl overflow-hidden glass border-2 transition-all duration-300",
              activeIndex === index
                ? "border-luxury-gold scale-105"
                : "border-transparent opacity-50 hover:opacity-100",
            )}
          >
            <Image
              src={image.image}
              alt="Thumbnail"
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
