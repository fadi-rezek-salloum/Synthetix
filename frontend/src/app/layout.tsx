import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/ToastContainer";

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
        <ErrorBoundary>
          <SafeGoogleProvider>
            <AuthProvider>
              <WishlistProvider>
                <CartProvider>
                  <Header />
                  <div className="flex-grow">
                    {children}
                  </div>
                  <Footer />
                  <ToastContainer />
                </CartProvider>
              </WishlistProvider>
            </AuthProvider>
          </SafeGoogleProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

function SafeGoogleProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <>
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-500 text-white text-[10px] py-1 px-4 text-center sticky top-0 z-[9999] font-mono">
            CRITICAL: NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing from environment. Social login will fail.
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
