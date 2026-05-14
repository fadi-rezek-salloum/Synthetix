import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acquisition Process | Synthetix",
  description: "Secure terminal for finalizing your identity drop.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
