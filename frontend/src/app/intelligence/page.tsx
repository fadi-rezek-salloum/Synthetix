"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Brain, Sparkles, Fingerprint, Activity } from "lucide-react";

export default function IntelligencePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <main className="min-h-screen bg-black overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 pt-40 pb-24 relative z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto mb-24">
          <div className="flex items-center justify-center gap-3 mb-6 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">
              The Synthetix Neural Core
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            Identity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600">
              Intelligence.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto">
            Our proprietary AI does not just recommend clothes. It analyzes your digital footprint to decode your purest aesthetic truth.
          </p>
        </motion.div>

        {/* Hero Image Section */}
        <motion.div
          variants={itemVariants}
          className="w-full h-[60vh] rounded-[3rem] overflow-hidden relative mb-32 border border-white/5 shadow-2xl shadow-indigo-500/10"
        >
          <Image
            src="/intelligence_hero.png"
            alt="AI Neural Network Fashion"
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
            <div className="glass px-8 py-6 rounded-3xl border-white/10 max-w-md">
              <h3 className="text-xl font-bold mb-2">Deep Curation Engine</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Analyzing over 10,000 parameters per garment to match the exact mathematical frequency of your personal style profile.
              </p>
            </div>
            <div className="hidden md:flex gap-4">
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="w-8 h-8" />,
              title: "Cognitive Matching",
              desc: "Algorithms trained on high-fashion archives to instantly recognize your silhouette preferences.",
            },
            {
              icon: <Fingerprint className="w-8 h-8" />,
              title: "Digital Fingerprint",
              desc: "Every interaction builds your unique aesthetic matrix, refining future curations to mathematical perfection.",
            },
            {
              icon: <Sparkles className="w-8 h-8" />,
              title: "Style Forecasting",
              desc: "Predictive modeling that identifies micro-trends aligned with your identity before they hit the mainstream.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="glass p-10 rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-colors group"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
