"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, updateQuantity, loading } = useCart();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-black pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-10 h-10 text-zinc-700" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic mb-4">Your Bag is Empty</h1>
          <p className="text-zinc-500 mb-12">Looks like you have not added any items to your curated collection yet.</p>
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
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic mb-4">Your Bag</h1>
            <p className="text-zinc-500 font-medium">{cart.items.length} items ready for acquisition</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="glass p-6 rounded-3xl border-white/5 flex gap-6 group relative overflow-hidden"
                >
                  <div className="w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 relative">
                    {item.variant.product.images?.[0] ? (
                      <img 
                        src={item.variant.product.images[0].image} 
                        alt={item.variant.product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700">NO IMG</div>
                    )}
                  </div>

                  <div className="flex-grow flex flex-col justify-between py-2">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-medium mb-1">
                        {item.variant.product.brand}
                      </p>
                      <h3 className="text-xl font-bold text-white mb-2">{item.variant.product.name}</h3>
                      <div className="flex gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full text-xs">
                          Size: <span className="text-white font-bold">{item.variant.size}</span>
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full text-xs">
                          Color: <span className="text-white font-bold">{item.variant.color}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-full p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-20"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-black text-white w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xl font-black text-white">${item.subtotal}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-6 right-6 p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="glass p-8 rounded-3xl border-white/5 sticky top-32">
              <h3 className="text-xl font-bold text-white mb-8">Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="text-white">${cart.total_price}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-emerald-500 uppercase text-[10px] font-black tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Complimentary</span>
                </div>
                <div className="w-full h-px bg-white/5 my-4" />
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500">Total</span>
                  <span className="text-3xl font-black text-white tracking-tighter">${cart.total_price}</span>
                </div>
              </div>

              <button 
                onClick={() => router.push('/checkout')}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-luxury-gold transition-all shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98]"
              >
                Proceed to Checkout
              </button>
              
              <p className="mt-6 text-[10px] text-center text-zinc-600 font-medium uppercase tracking-widest">
                Secure checkout powered by Synthetix
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
