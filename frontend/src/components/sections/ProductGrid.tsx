"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { productService } from "@/services/productService";
import ProductCard from "../ui/ProductCard";

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-zinc-500">
        Loading Collections...
      </div>
    );

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter mb-4">
            Curated Drop
          </h2>
          <p className="text-zinc-500">
            Hand-selected pieces from our verified vendors.
          </p>
        </div>
        <button className="text-sm font-bold tracking-widest uppercase hover:text-luxury-gold transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
