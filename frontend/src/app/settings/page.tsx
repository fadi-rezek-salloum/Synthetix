"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Shield, Bell, Key, Smartphone, Monitor, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("security");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700 animate-pulse">
          Accessing Protocols...
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "security", label: "Security & Access", icon: <Shield className="w-4 h-4" /> },
    { id: "notifications", label: "Comms & Alerts", icon: <Bell className="w-4 h-4" /> },
    { id: "preferences", label: "System Preferences", icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-black pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic mb-4">
            System Config
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide">
            Adjust your platform parameters and security protocols.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:w-64 shrink-0 space-y-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Settings Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 glass rounded-3xl p-8 border-white/5"
          >
            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Authentication Protocols</h2>
                  <p className="text-sm text-zinc-500 mb-6">Manage how you access your Synthetix identity.</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-xl">
                          <Key className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Password</div>
                          <div className="text-xs text-zinc-500 mt-1">Last changed 30 days ago</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors">
                        Update
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 rounded-xl">
                          <Smartphone className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Two-Factor Authentication</div>
                          <div className="text-xs text-zinc-500 mt-1">Add an extra layer of security</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-400 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <h2 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h2>
                  <p className="text-sm text-zinc-500 mb-6">Permanent operational actions.</p>
                  
                  <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-500/10 rounded-xl">
                        <Lock className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-red-400">Deactivate Identity</div>
                        <div className="text-xs text-red-400/70 mt-1">Permanently erase your account</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/30 transition-colors">
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Communication Preferences</h2>
                  <p className="text-sm text-zinc-500 mb-6">Select what information you receive from Synthetix.</p>
                  
                  <div className="space-y-4">
                    {[
                      { title: "Order Updates", desc: "Shipping and tracking notifications", active: true },
                      { title: "Exclusive Drops", desc: "Early access to limited collections", active: true },
                      { title: "Security Alerts", desc: "Login attempts from new devices", active: true },
                      { title: "AI Style Recommendations", desc: "Weekly curated looks based on your history", active: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div>
                          <div className="text-sm font-bold text-white">{item.title}</div>
                          <div className="text-xs text-zinc-500 mt-1">{item.desc}</div>
                        </div>
                        <button 
                          className={`w-12 h-6 rounded-full relative transition-colors ${item.active ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${item.active ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Monitor className="w-16 h-16 text-zinc-800 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">System Optimal</h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Your platform preferences are currently synchronized with the global dark mode default. 
                  Additional customization modules will be available in future updates.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
