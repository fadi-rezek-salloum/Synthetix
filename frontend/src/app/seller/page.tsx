"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Plus, 
  TrendingUp, 
  Users, 
  Settings,
  MoreVertical,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ChevronRight
} from "lucide-react";
import { Product, Order, PaginatedResponse } from "@/types";
import { productService } from "@/services/productService";
import { logger } from "@/lib/logger";
import Image from "next/image";

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "orders">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "SELLER")) {
      router.push("/");
      return;
    }

    if (user && user.role === "SELLER") {
      fetchSellerData();
    }
  }, [user, loading, router]);

  const fetchSellerData = async () => {
    try {
      setProductsLoading(true);
      // In a real app, we'd have a specific endpoint for seller's own products
      // For now, we'll just filter all products (conceptually)
      const data = await productService.getAll();
      setProducts(data.results);
    } catch (err) {
      logger.error("Failed to fetch seller data", { error: err });
    } finally {
      setProductsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
          Initializing Terminal...
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "inventory", label: "Inventory", icon: <Package className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-black pt-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 flex gap-12">
        
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-32 h-fit">
          <div className="glass rounded-3xl p-6 border-white/5">
            <div className="flex items-center gap-4 mb-10 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white">
                {user.first_name[0]}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white">{user.first_name}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-medium">Seller Account</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === item.id 
                      ? "bg-white text-black" 
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-white/5 my-6" />
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
                <Settings className="w-4 h-4" />
                Store Settings
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-grow pb-24">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
                {activeTab === "overview" && "Performance Core"}
                {activeTab === "inventory" && "Artifact Management"}
                {activeTab === "orders" && "Acquisition Stream"}
              </h1>
              <p className="text-zinc-500 font-medium">Monitoring your brand presence on the Synthetix network.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
              <Plus className="w-4 h-4" />
              New Drop
            </button>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: "$42,500", icon: <TrendingUp className="text-emerald-400" />, trend: "+12%" },
                    { label: "Active Orders", value: "18", icon: <ShoppingBag className="text-indigo-400" />, trend: "+3" },
                    { label: "Identity Reach", value: "12.4k", icon: <Users className="text-purple-400" />, trend: "+5.2%" },
                    { label: "Conversion", value: "3.2%", icon: <Package className="text-amber-400" />, trend: "-0.4%" },
                  ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        {stat.icon}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          stat.trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Products Table Preview */}
                <div className="glass rounded-[2.5rem] border-white/5 overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Recent Inventory</h3>
                    <button 
                      onClick={() => setActiveTab("inventory")}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    >
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Product</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Price</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Stock</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                          <th className="px-8 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {products.slice(0, 5).map((product) => (
                          <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                                  {product.images?.[0] && (
                                    <Image src={product.images[0].image} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                                  )}
                                </div>
                                <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-sm text-zinc-400">${product.base_price}</td>
                            <td className="px-8 py-4 text-sm text-zinc-400">
                              {product.variants.reduce((acc, v) => acc + v.stock, 0)} units
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text" 
                      placeholder="Search identity collection..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-grow sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
                      <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex-grow sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="glass p-6 rounded-[2rem] border-white/5 hover:border-white/10 transition-all group">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 mb-6 relative">
                        {product.images?.[0] && (
                          <Image src={product.images[0].image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                           <button className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-black transition-all">
                             <Eye className="w-4 h-4" />
                           </button>
                           <button className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-black transition-all">
                             <Edit3 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold text-white">{product.name}</h4>
                        <span className="text-lg font-light text-zinc-400">${product.base_price}</span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-6">{product.description}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live on Network</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">
                          {product.variants.reduce((acc, v) => acc + v.stock, 0)} Units Available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8">
                  <ShoppingBag className="w-10 h-10 text-zinc-800" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">No Acquisitions Detected</h3>
                <p className="text-zinc-500 max-w-sm font-medium">Your brand has not received any acquisition requests in this cycle yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
