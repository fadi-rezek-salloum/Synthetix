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
  LogIn,
  UserPlus,
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1 pr-2 bg-white/5 rounded-full border border-white/5 hover:border-white/20 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden group-hover:bg-zinc-700 transition-colors">
          <User className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
        </div>
        {user && (
          <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
            {user.username}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-4 w-60 glass border-white/10 rounded-2xl p-2 shadow-2xl z-50"
          >
            {user ? (
              // MEMBER VIEW
              <>
                <div className="px-4 py-3 mb-2 border-b border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    Personal Account
                  </p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <MenuLink
                    href="/profile"
                    icon={<User className="w-4 h-4" />}
                    label="Personal Profile"
                  />
                  <MenuLink
                    href="/identity"
                    icon={<Sparkles className="w-4 h-4" />}
                    label="AI Identity Insights"
                  />
                  <MenuLink
                    href="/settings"
                    icon={<Settings className="w-4 h-4" />}
                    label="Vault Settings"
                  />
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full mt-2 flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Session
                </button>
              </>
            ) : (
              // GUEST VIEW
              <>
                <div className="px-4 py-3 mb-2 border-b border-white/5 text-center">
                  <p className="text-sm font-bold">Welcome to Synthetix</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                    Sign in to unlock AI curation
                  </p>
                </div>
                <div className="space-y-1">
                  <MenuLink
                    href="/auth/login"
                    icon={<LogIn className="w-4 h-4" />}
                    label="Sign In"
                  />
                  <MenuLink
                    href="/auth/register"
                    icon={<UserPlus className="w-4 h-4" />}
                    label="Create Account"
                  />
                </div>
              </>
            )}
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <Link
    href={href}
    className="flex items-center gap-3 px-4 py-3 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
  >
    {icon}
    {label}
  </Link>
);

export default UserMenu;
