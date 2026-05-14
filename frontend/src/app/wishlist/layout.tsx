import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Archive | Wishlist",
  description: "Curated selection of artifacts saved for future acquisition.",
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
