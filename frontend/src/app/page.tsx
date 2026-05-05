import { Metadata } from "next";
import Hero from "@/components/sections/hero";
import ProductGrid from "@/components/sections/ProductGrid";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Synthetix | AI-Powered Luxury Fashion",
  description: "Experience the future of fashion with Synthetix. Our AI-driven curation matches you with high-end streetwear and luxury pieces that define your aesthetic.",
};

const FeatureHighlight = () => (
  <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-luxury-gold mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-4">Neural Curation</h3>
        <p className="text-zinc-500 leading-relaxed">
          Our AI analyzes global trends and your personal style to present only the most relevant pieces.
        </p>
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-luxury-gold mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-4">Verified Authenticity</h3>
        <p className="text-zinc-500 leading-relaxed">
          Every item in our catalog is sourced from verified vendors and undergoes a rigorous authenticity check.
        </p>
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-luxury-gold mb-6">
          <Zap className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-4">Instant Identity</h3>
        <p className="text-zinc-500 leading-relaxed">
          Define your digital fashion footprint instantly with our rapid identity profiling engine.
        </p>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Hero />
      <ProductGrid />
      <FeatureHighlight />
      
      {/* Visual Break / Newsletter CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto glass p-12 md:p-24 rounded-[3rem] text-center border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 relative z-10">
            Join the <br />
            Aesthetic Revolution.
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto relative z-10">
            Subscribe to get early access to exclusive AI-curated drops and fashion forecasting reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto relative z-10">
            <input 
              type="email" 
              placeholder="Email address" 
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-luxury-gold transition-colors"
            />
            <button className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-zinc-200 transition-all">
              Join Now
            </button>
          </div>
        </div>
      </section>

      <div className="h-24" />
    </main>
  );
}
