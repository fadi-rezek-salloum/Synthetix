"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Lock, MapPin, CreditCard, ChevronRight, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, loading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (loading) return null;
  if (!cart || cart.items.length === 0) {
    if (typeof window !== "undefined") router.push("/cart");
    return null;
  }

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await apiFetch("/orders/orders/checkout/", {
        method: "POST",
        body: JSON.stringify({ shipping_address: shippingAddress }),
      });
      setStep(3); // Success step
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        {step < 3 && (
          <div className="flex items-center gap-4 mb-12">
            <button onClick={() => router.back()} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Acquisition Process</h1>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {step < 3 ? (
            <>
              <div className="lg:col-span-3 space-y-8">
                {/* Step 1: Shipping */}
                <div className={cn("glass p-8 rounded-3xl border-white/5 transition-all", step === 1 ? "opacity-100 ring-2 ring-indigo-500/50" : "opacity-40")}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">1</div>
                    <h3 className="text-xl font-bold text-white">Shipping Details</h3>
                  </div>
                  
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Shipping Address</label>
                        <textarea 
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Street, City, State, ZIP, Country"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-all h-32 resize-none"
                        />
                      </div>
                      <button 
                        disabled={!shippingAddress}
                        onClick={() => setStep(2)}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-luxury-gold transition-all disabled:opacity-20"
                      >
                        Continue to Payment
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Step 2: Payment */}
                <div className={cn("glass p-8 rounded-3xl border-white/5 transition-all", step === 2 ? "opacity-100 ring-2 ring-indigo-500/50" : "opacity-40")}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">2</div>
                    <h3 className="text-xl font-bold text-white">Payment Method</h3>
                  </div>
                  
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center">
                        <CreditCard className="w-8 h-8 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-sm font-medium">Payment logic integrated with Stripe/Adyen will go here.</p>
                        <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-2">Test Mode Enabled</p>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setStep(1)}
                          className="flex-1 py-4 bg-white/5 text-white font-black uppercase tracking-widest text-xs rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                        >
                          Back
                        </button>
                        <button 
                          onClick={handleCheckout}
                          disabled={isProcessing}
                          className="flex-[2] py-4 bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                          {isProcessing ? "Processing..." : "Complete Acquisition"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="glass p-8 rounded-3xl border-white/5 sticky top-32">
                  <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 text-xs font-bold w-4 text-center">{item.quantity}x</span>
                          <span className="text-white text-sm font-medium truncate max-w-[120px]">{item.variant.product.name}</span>
                        </div>
                        <span className="text-white font-bold text-sm">${item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-zinc-500 text-sm">
                      <span>Subtotal</span>
                      <span className="text-white">${cart.total_price}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-zinc-500 text-sm">Total</span>
                      <span className="text-3xl font-black text-white tracking-tighter">${cart.total_price}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Encrypted Transaction Protocol</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">Acquisition Successful</h2>
              <p className="text-zinc-500 mb-12 max-w-md font-medium">Your request has been logged in the network. Check your dashboard for tracking updates.</p>
              <div className="flex gap-4">
                <Link 
                  href="/orders"
                  className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-luxury-gold transition-all"
                >
                  Track Order
                </Link>
                <Link 
                  href="/"
                  className="px-8 py-4 bg-white/5 text-white border border-white/10 font-black uppercase tracking-widest text-xs rounded-full hover:bg-white/10 transition-all"
                >
                  Return Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

