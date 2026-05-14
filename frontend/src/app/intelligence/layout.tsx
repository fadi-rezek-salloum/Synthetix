import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neural Core | Intelligence",
  description: "Decode your aesthetic truth with Synthetix proprietary AI identity mapping.",
};

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
