import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Synthetix | Premium Fashion & AI Style Identity",
  description: "Experience the future of fashion. Synthetix combines high-end streetwear with AI-driven style discovery and identity-first security.",
  keywords: ["fashion", "streetwear", "AI", "premium", "luxury", "Synthetix"],
  openGraph: {
    title: "Synthetix | Premium Fashion",
    description: "AI-Driven Identity & Style Discovery",
    type: "website",
    url: "https://synthetix.com",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <Header />
                <div className="flex-grow">
                  {children}
                </div>
                <Footer />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
