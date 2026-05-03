"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const displayImage =
    product.images.find((img) => img.is_feature)?.image ||
    product.images[0]?.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      className={cn("group", "cursor-pointer")}
    >
      <Link href={`/catalog/${product.slug}`}>
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-2xl glass mb-6",
          )}
        >
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
              No Image
            </div>
          )}

          {product.discount_price && (
            <div className="absolute top-4 left-4 bg-luxury-gold text-black text-[10px] font-bold px-3 py-1 rounded-full tracking-tighter uppercase">
              Limited Drop
            </div>
          )}
        </div>

        <div className="space-y-1 px-2">
          <p className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-medium">
            {product.brand}
          </p>
          <h3 className="text-lg font-semibold tracking-tight group-hover:text-luxury-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-white font-medium">
              ${product.discount_price || product.base_price}
            </span>
            {product.discount_price && (
              <span className="text-zinc-600 line-through text-sm">
                ${product.base_price}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
