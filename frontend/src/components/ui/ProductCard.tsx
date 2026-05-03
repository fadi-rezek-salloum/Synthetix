"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  
  const isWishlisted = wishlistIds.includes(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      // Redirect to login or show toast?
      return;
    }
    toggleWishlist(product.id);
  };

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

          <button
            onClick={handleWishlistClick}
            className={cn(
              "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20",
              isWishlisted 
                ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : "bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black"
            )}
          >
            <Heart 
              className={cn("w-5 h-5 transition-transform duration-300", isWishlisted && "fill-current scale-110")} 
            />
          </button>
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
