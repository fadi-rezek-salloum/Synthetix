"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, User, LogOut } from "lucide-react";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter hover:opacity-70 transition-opacity"
        >
          SYNTHETIX
        </Link>

        <div className="hidden md:flex items-center gap-10 text-sm font-medium tracking-widest uppercase">
          <Link
            href="/catalog"
            className="hover:text-zinc-400 transition-colors"
          >
            Catalog
          </Link>
          <Link
            href="/identity"
            className="hover:text-zinc-400 transition-colors"
          >
            Identity AI
          </Link>
          <Link
            href="/collections"
            className="hover:text-zinc-400 transition-colors"
          >
            Collections
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative hover:opacity-70 transition-opacity">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </button>

          <UserMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
