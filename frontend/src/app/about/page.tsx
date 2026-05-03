"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MoveRight } from "lucide-react";
import Link from "next/link";

export default function VisionPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        {/* Typographic Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 block">
              The Manifesto
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-10 text-white">
              Redefining <br />
              <span className="text-zinc-500">The Fabric of</span> <br />
              Identity.
            </h1>
            <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-lg mb-10">
              Synthetix was born from a singular belief: fashion is not about consuming trends. It is the profound, visible manifestation of the self.
            </p>
            <Link 
              href="/catalog"
              className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-white hover:opacity-70 transition-opacity"
            >
              Explore the Archive <MoveRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden"
          >
            <Image
              src="/vision_hero.png"
              alt="Synthetix Vision"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none" />
          </motion.div>
        </div>

        {/* The Core Values */}
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24 border-t border-white/10 pt-24"
        >
          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">01. Absolute Authenticity</h2>
            <p className="text-zinc-500 leading-relaxed text-lg font-light">
              We reject the fast-fashion paradigm. Every piece on Synthetix is rigorously vetted, sourced from elite independent designers, and guaranteed to hold authentic structural and aesthetic value.
            </p>
          </motion.div>
          
          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">02. Algorithmic Precision</h2>
            <p className="text-zinc-500 leading-relaxed text-lg font-light">
              By merging human curation with advanced neural networks, we eliminate the noise of the market. We present you only with the garments that mathematically align with your identity parameters.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">03. The Vault Concept</h2>
            <p className="text-zinc-500 leading-relaxed text-lg font-light">
              A wardrobe should be built, not bought. We encourage our patrons to view their acquisitions as investments into a personal vault of expression, curated slowly and deliberately over time.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-white">04. Global Connectivity</h2>
            <p className="text-zinc-500 leading-relaxed text-lg font-light">
              Synthetix shatters geographical boundaries, bridging the gap between visionary underground designers in Tokyo and avant-garde collectors in Paris seamlessly.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
