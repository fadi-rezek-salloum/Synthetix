import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/hero";
import ProductGrid from "@/components/sections/ProductGrid";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <ProductGrid />

      <div className="h-[50vh]" />
    </main>
  );
}
