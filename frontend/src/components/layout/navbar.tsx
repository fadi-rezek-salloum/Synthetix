"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, User, Search, Menu } from "lucide-react";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6"
    >
      <div className="glass w-full max-w-7xl px-8 py-4 rounded-full flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter hover:opacity-70 transition-opacity"
        >
          SYNTHETIX
        </Link>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium tracking-widest uppercase">
          <Link
            href="/catalog"
            className="hover:text-luxury-gold transition-colors"
          >
            Catalog
          </Link>
          <Link
            href="/intelligence"
            className="hover:text-luxury-gold transition-colors"
          >
            Identity AI
          </Link>
          <Link
            href="/about"
            className="hover:text-luxury-gold transition-colors"
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Search className="w-5 h-5 cursor-pointer hover:text-luxury-gold transition-colors" />
          <Link href="/auth/login">
            <User className="w-5 h-5 cursor-pointer hover:text-luxury-gold transition-colors" />
          </Link>
          <ShoppingBag className="w-5 h-5 cursor-pointer hover:text-luxury-gold transition-colors" />
          <Menu className="md:hidden w-6 h-6 cursor-pointer" />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
