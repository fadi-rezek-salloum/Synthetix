"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  User,
  Settings,
  Sparkles,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1 pr-3 bg-white/5 rounded-full border border-white/5 hover:border-white/20 transition-all focus:outline-none"
      >
        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
          {user.first_name?.[0] || <User className="w-3 h-3" />}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors hidden sm:block">
          {user.first_name || "Account"}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-4 w-64 bg-zinc-950/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-[0_0_40px_-10px_rgba(0,0,0,1)] z-50 pointer-events-auto"
          >
            <div className="px-4 py-4 mb-2 border-b border-white/5">
              <p className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold mb-1">
                Active Session
              </p>
              <p className="text-sm font-medium text-white truncate">
                {user.email}
              </p>
              {user.role === "seller" && (
                <span className="inline-block mt-2 text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                  Seller Account
                </span>
              )}
            </div>

            <div className="space-y-1">
              {user.role === "seller" && (
                <MenuLink
                  href="/seller"
                  icon={<LayoutDashboard className="w-4 h-4" />}
                  label="Seller Dashboard"
                  onClick={() => setIsOpen(false)}
                />
              )}
              <MenuLink
                href="/profile"
                icon={<User className="w-4 h-4" />}
                label="Profile"
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href="/intelligence"
                icon={<Sparkles className="w-4 h-4" />}
                label="AI Tools"
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href="/settings"
                icon={<Settings className="w-4 h-4" />}
                label="Settings"
                onClick={() => setIsOpen(false)}
              />
            </div>

            <div className="mt-2 pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all focus:outline-none"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuLink = ({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
  >
    {icon}
    {label}
  </Link>
);

export default UserMenu;
