import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Bag | Synthetix",
  description: "Review your curated collection before final acquisition.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
