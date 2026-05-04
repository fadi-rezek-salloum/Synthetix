"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Order, PaginatedResponse } from "@/types";
import { apiFetch } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Package, Clock, CheckCircle2, Truck, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiFetch<PaginatedResponse<Order>>("/orders/orders/")
        .then((data) => {
          setOrders(data.results || []);
        })
        .catch((err) => logger.error("Failed to load orders", err, { component: "OrdersPage" }))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4 text-amber-500" />;
      case "PAID": return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
      case "SHIPPED": return <Truck className="w-4 h-4 text-blue-500" />;
      case "DELIVERED": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "CANCELLED": return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
          Retrieving History...
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-10 h-10 text-zinc-700" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic mb-4">No Orders Found</h1>
          <p className="text-zinc-500 mb-12">Your acquisition history is currently blank. Start your first drop today.</p>
          <Link 
            href="/catalog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-luxury-gold transition-colors"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic mb-4">My Orders</h1>
            <p className="text-zinc-500 font-medium">Tracking {orders.length} acquisitions across the network.</p>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl border-white/5 overflow-hidden group hover:border-white/20 transition-all"
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Order #{order.id}</h3>
                      <p className="text-zinc-500 text-xs">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Total Amount</p>
                      <p className="text-white font-black text-xl">${order.total_amount}</p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest",
                      order.status === "DELIVERED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      order.status === "CANCELLED" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                      "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    )}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-white/[0.02]">
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900">
                          {item.product.images?.[0] ? (
                            <img src={item.product.images[0].image} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700">NA</div>
                          )}
                        </div>
                        <div className="pr-4">
                          <p className="text-white text-xs font-bold truncate max-w-[150px]">{item.product.name}</p>
                          <p className="text-zinc-500 text-[10px] uppercase font-medium">{item.variant_info}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
