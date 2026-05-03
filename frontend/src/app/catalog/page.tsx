"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Grid2X2, 
  List,
  SlidersHorizontal
} from "lucide-react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { Product, Category, PaginatedResponse } from "@/types";
import ProductCard from "@/components/ui/ProductCard";

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentCategory = searchParams.get("category") || "";
  
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodData, catData] = await Promise.all([
          productService.getProducts(currentPage, currentCategory),
          categoryService.getCategories(),
        ]);
        setData(prodData);
        setCategories(catData);
      } catch (error) {
        console.error("Failed to load catalog:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, currentCategory]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/catalog?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/catalog?${params.toString()}`);
  };

  const totalPages = data ? Math.ceil(data.count / 12) : 0; // Assuming 12 per page

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">
            The Archive
          </h1>
          <p className="text-zinc-500 max-w-md">
            Every piece in our collection is an artifact of identity. Filter by aesthetic essence to find your frequency.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Close Filters" : "Filters"}
          </button>
        </div>
      </div>

      {/* Filters Drawer (Mobile/Desktop Toggle) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="p-8 glass rounded-[2.5rem] border-white/5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button
                onClick={() => handleCategoryChange("")}
                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  !currentCategory 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/20"
                }`}
              >
                All Pieces
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    currentCategory === cat.slug
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]"
                      : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/20"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 opacity-50">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !data || !Array.isArray(data.results) || data.results.length === 0 ? (
        <div className="py-40 text-center glass rounded-[3rem] border-white/5">
          <Search className="w-12 h-12 mx-auto text-zinc-700 mb-6" />
          <h2 className="text-2xl font-bold mb-2">No artifacts found</h2>
          <p className="text-zinc-500">Try adjusting your filters or checking back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {data.results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-24 flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-12 h-12 rounded-full text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-white text-black"
                          : "text-zinc-500 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-black">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-6 pt-32 text-center text-zinc-500">
          Syncing Catalog...
        </div>
      }>
        <CatalogContent />
      </Suspense>
    </main>
  );
}
