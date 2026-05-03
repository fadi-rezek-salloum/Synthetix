"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserMenu from "./UserMenu";

export const Header = () => {
  const { user, logout, loading } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-full px-8 py-3 flex items-center gap-8 pointer-events-auto border-white/5 shadow-2xl shadow-black/50"
      >
        <Link
          href="/"
          className="text-xl font-black tracking-tighter text-white mr-4 hover:scale-105 transition-transform"
        >
          SYNTHETIX
        </Link>

        <div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/catalog" className="hover:text-white transition-colors">
            Catalog
          </Link>
          <Link href="/intelligence" className="hover:text-white transition-colors">
            Intelligence
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            Our Vision
          </Link>
        </div>

        <div className="h-4 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-500 hover:text-white transition-colors">
            <Search className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            {!user && !loading ? (
              <motion.div
                key="guest"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Link
                  href="/auth/login"
                  className="text-[10px] font-bold uppercase tracking-widest text-white px-5 py-2 bg-white/10 rounded-full hover:bg-white transition-all hover:text-black"
                >
                  Sign In
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="user"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-6"
              >
                <UserMenu />
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            href="/cart"
            className="relative p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white border border-white/5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-zinc-950" />
          </Link>
        </div>
      </motion.nav>
    </header>
  );
};
