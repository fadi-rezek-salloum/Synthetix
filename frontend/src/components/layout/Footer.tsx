"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Send, Camera, ArrowUpRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
          <div className="col-span-1 md:col-span-2">
            <Link 
              href="/"
              className="text-3xl font-black tracking-tighter text-white mb-8 block"
            >
              SYNTHETIX
            </Link>
            <p className="text-zinc-500 max-w-sm mb-8 font-medium leading-relaxed">
              The next iteration of fashion identity. AI-driven style discovery, curated by the most forward-thinking brands in the network.
            </p>
            <div className="flex gap-4">
              {[Camera, Send, Terminal].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:bg-white hover:text-black transition-all"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase text-[10px] tracking-[0.3em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {['Catalog', 'Intelligence', 'Our Vision', 'Archive'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center group">
                    {item} <ArrowUpRight className="w-3 h-3 ml-2 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase text-[10px] tracking-[0.3em] mb-8">Identity</h4>
            <ul className="space-y-4">
              {['My Profile', 'Order History', 'Wishlist', 'Settings'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center group">
                    {item} <ArrowUpRight className="w-3 h-3 ml-2 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
            &copy; {new Date().getFullYear()} Synthetix Network. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
            <Link href="#" className="hover:text-zinc-500 transition-colors">Privacy Protocol</Link>
            <Link href="#" className="hover:text-zinc-500 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
