"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { wishlistService } from "@/services/wishlistService";
import { orderService } from "@/services/orderService";
import { logger } from "@/lib/logger";
import { resolveBackendUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { User, Mail, Package, Heart, MapPin, CreditCard } from "lucide-react";
import { Order, Product } from "@/types";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    addresses: 0,
    payments: 0
  });
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      // Fetch dynamic stats
      const fetchStats = async () => {
        try {
          const [wishlistRes, ordersRes] = await Promise.all([
            wishlistService.getWishlist(),
            orderService.getOrders(),
          ]);
          
          setStats({
            orders: ordersRes.count || 0,
            wishlist: wishlistRes.length || 0,
            addresses: user.addresses?.length || 0,
            payments: 0 // Placeholder for now
          });
        } catch (err) {
          logger.error("Failed to fetch profile stats", err, { component: "ProfilePage" });
        }
      };
      fetchStats();
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
          Loading Profile...
        </div>
      </div>
    );
  }

  const avatarUrl = user.avatar || user.logo;
  const fullAvatarUrl = resolveBackendUrl(avatarUrl);

  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic mb-4">
            Your Profile
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide">
            Manage your account details and view your orders.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-3xl p-8 border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mb-6 shadow-2xl shadow-indigo-500/20 overflow-hidden">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center border-4 border-black overflow-hidden">
                    {fullAvatarUrl ? (
                      <img src={fullAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {user.first_name} {user.last_name}
                </h2>
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-6">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>

                <div className="w-full h-px bg-white/5 mb-6" />

                <div className="w-full space-y-3 text-left">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Account Type</span>
                    <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Phone</span>
                    <span className="text-zinc-300 font-medium text-xs">
                      {user.phone_number || "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity Grid */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                { icon: <Package />, label: "Orders", value: stats.orders, desc: "No active orders" },
                { icon: <Heart />, label: "Wishlist", value: stats.wishlist, desc: "Items you have liked" },
                { icon: <MapPin />, label: "Addresses", value: stats.addresses, desc: "Saved shipping info" },
                { icon: <CreditCard />, label: "Payments", value: stats.payments, desc: "Saved payment methods" },
              ].map((stat, i) => (
                <div key={i} className="glass p-6 rounded-3xl border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform origin-left">{stat.icon}</div>
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-zinc-300">{stat.label}</div>
                  <div className="text-xs text-zinc-600 mt-1">{stat.desc}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-8 border-white/5"
            >
              <h3 className="text-xl font-bold text-white mb-6">Recent Orders</h3>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <Package className="w-12 h-12 text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-medium">You have not placed any orders yet.</p>
                <button 
                  onClick={() => router.push('/')}
                  className="mt-6 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-8"
                >
                  Start Shopping
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
