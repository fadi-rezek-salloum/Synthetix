"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-[150px] md:text-[200px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent italic select-none">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="-mt-12 md:-mt-20"
        >
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic mb-4 tracking-tight">
            Artifact Lost in Transmission
          </h2>
          <p className="text-zinc-500 font-medium mb-12 max-w-sm mx-auto">
            The coordinates you are tracking do not exist in our current database. Return to the core or try another query.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-luxury-gold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Hub
            </Link>
            <Link
              href="/catalog"
              className="flex items-center gap-2 px-8 py-4 bg-white/5 text-white border border-white/10 font-black uppercase tracking-widest text-xs rounded-full hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <Search className="w-4 h-4" /> Explore Archive
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </main>
  );
}
