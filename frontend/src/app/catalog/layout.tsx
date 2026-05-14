import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive | Synthetix Collection",
  description: "Browse the curated collection of premium streetwear and avant-garde fashion artifacts.",
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
