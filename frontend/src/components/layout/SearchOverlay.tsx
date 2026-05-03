"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Product } from "@/types";
import Link from "next/link";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length > 2) {
      const timer = setTimeout(() => {
        setLoading(true);
        apiFetch<{ results?: Product[] }>(
          `/catalog/products/?search=${encodeURIComponent(query)}`,
        )
          .then((data) => setResults(data.results || []))
          .catch(console.error)
          .finally(() => setLoading(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      window.setTimeout(() => setResults([]), 0);
    }
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      window.setTimeout(() => setQuery(""), 0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col p-6 md:p-12"
        >
          <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Neural Search Engine</span>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500" />
              <input 
                autoFocus
                type="text"
                placeholder="Search the Archive..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/5 border-b-2 border-white/10 px-16 py-8 text-3xl md:text-5xl font-black text-white placeholder:text-zinc-800 focus:outline-none focus:border-indigo-500 transition-colors italic tracking-tighter"
              />
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Querying Database...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                  {results.map((product) => (
                    <Link 
                      key={product.id}
                      href={`/catalog/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-6 p-4 bg-white/5 rounded-3xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group"
                    >
                      <div className="w-20 h-20 bg-zinc-900 rounded-2xl overflow-hidden flex-shrink-0">
                        {product.images?.[0] && (
                          <img src={product.images[0].image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{product.brand}</p>
                        <h4 className="text-white font-bold group-hover:text-luxury-gold transition-colors">{product.name}</h4>
                        <p className="text-zinc-400 text-xs mt-1">${product.base_price}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors mr-2" />
                    </Link>
                  ))}
                </div>
              ) : query.length > 2 ? (
                <div className="text-center py-24">
                  <p className="text-zinc-700 font-bold uppercase tracking-widest italic">No matches found in the archive.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['T-Shirts', 'Outerwear', 'Denim', 'Accessories'].map((cat) => (
                    <button 
                      key={cat}
                      className="px-6 py-8 bg-white/5 rounded-3xl border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left group"
                    >
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Category</p>
                      <p className="text-white font-bold group-hover:text-indigo-400 transition-colors">{cat}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
