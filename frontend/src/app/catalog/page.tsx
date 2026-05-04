"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  SlidersHorizontal,
  X,
  Check
} from "lucide-react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { logger } from "@/lib/logger";
import { Product, Category, PaginatedResponse } from "@/types";
import ProductCard from "@/components/ui/ProductCard";

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Params
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentGender = searchParams.get("gender") || "";
  const currentSort = searchParams.get("ordering") || "-created_at";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";

  // Component State
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodData, catData, brandsData] = await Promise.all([
          productService.getProducts({
            page: currentPage,
            category: currentCategory,
            brand: currentBrand,
            gender: currentGender,
            ordering: currentSort,
            min_price: minPrice ? parseFloat(minPrice) : undefined,
            max_price: maxPrice ? parseFloat(maxPrice) : undefined,
          }),
          categoryService.getCategories(),
          productService.getBrands(),
        ]);
        setData(prodData);
        setCategories(catData);
        setBrands(brandsData);
      } catch (error) {
        logger.error("Failed to load catalog", error, { component: "CatalogPage" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, currentCategory, currentBrand, currentGender, currentSort, minPrice, maxPrice]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set("page", "1"); // Always reset to page 1 on filter change
    router.push(`/catalog?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/catalog?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = data ? Math.ceil(data.count / 20) : 0; // Backend PAGE_SIZE is 20

  const genders = [
    { label: "All", value: "" },
    { label: "Mens", value: "M" },
    { label: "Womens", value: "W" },
    { label: "Unisex", value: "U" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-6xl font-black tracking-tighter mb-6 text-white uppercase italic">
            The Archive
          </h1>
          <div className="flex flex-wrap gap-3">
            {currentCategory && (
              <span className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                {currentCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ category: null })} />
              </span>
            )}
            {currentBrand && (
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                {currentBrand}
                <X className="w-3 h-3 cursor-pointer" onClick={() => updateFilters({ brand: null })} />
              </span>
            )}
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <select 
            value={currentSort}
            onChange={(e) => updateFilters({ ordering: e.target.value })}
            className="bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl outline-none focus:border-white/20 transition-all appearance-none cursor-pointer pr-12 relative"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/19/9\' /%3E%3C/svg%3E")' }}
          >
            <option value="-created_at">Newest First</option>
            <option value="base_price">Price: Low to High</option>
            <option value="-base_price">Price: High to Low</option>
          </select>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              showFilters 
                ? "bg-white text-black border-white" 
                : "bg-white/5 text-white border-white/10 hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="lg:w-72 space-y-10 shrink-0"
            >
              {/* Categories */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Collections</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilters({ category: null })}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all ${!currentCategory ? "bg-white/10 text-white font-bold" : "text-zinc-500 hover:text-white"}`}
                  >
                    All Artifacts
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilters({ category: cat.slug })}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all ${currentCategory === cat.slug ? "bg-white/10 text-white font-bold" : "text-zinc-500 hover:text-white"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Gender */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Identity</h3>
                <div className="grid grid-cols-2 gap-2">
                  {genders.map((g) => (
                    <button
                      key={g.label}
                      onClick={() => updateFilters({ gender: g.value || null })}
                      className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                        currentGender === g.value 
                          ? "bg-white text-black border-white" 
                          : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Brands */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Foundry</h3>
                <div className="space-y-1">
                  {brands.map((b) => (
                    <label key={b} className="flex items-center gap-3 px-4 py-2 cursor-pointer group">
                      <div 
                        onClick={() => updateFilters({ brand: currentBrand === b ? null : b })}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          currentBrand === b ? "bg-indigo-500 border-indigo-500" : "border-white/10 group-hover:border-white/30"
                        }`}
                      >
                        {currentBrand === b && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-xs transition-all ${currentBrand === b ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                        {b}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Price Range */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Investment Range</h3>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilters({ min_price: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-white/20"
                  />
                  <div className="h-px w-4 bg-zinc-800" />
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilters({ max_price: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-white/20"
                  />
                </div>
              </section>

              <button 
                onClick={() => router.push('/catalog')}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors underline underline-offset-8"
              >
                Reset All Filters
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 opacity-50">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : !data || data.results.length === 0 ? (
            <div className="py-40 text-center glass rounded-[4rem] border-white/5">
              <Search className="w-16 h-16 mx-auto text-zinc-800 mb-8" />
              <h2 className="text-3xl font-black tracking-tighter mb-4 text-white">No artifacts detected</h2>
              <p className="text-zinc-500 max-w-xs mx-auto text-sm">
                The current parameters returned zero results from the archive.
              </p>
              <button 
                onClick={() => router.push('/catalog')}
                className="mt-12 px-8 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full"
              >
                Reset Archive
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {data.results.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-32 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl border border-white/10 hover:bg-white/5 disabled:opacity-10 transition-all group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (pageNum > 5 && pageNum < totalPages) return null; // Simple truncation
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-14 h-14 rounded-2xl text-[10px] font-black transition-all ${
                            currentPage === pageNum
                              ? "bg-white text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
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
                    className="w-14 h-14 flex items-center justify-center rounded-2xl border border-white/10 hover:bg-white/5 disabled:opacity-10 transition-all group"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-black">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
            Accessing Archive...
          </div>
        </div>
      }>
        <CatalogContent />
      </Suspense>
    </main>
  );
}
