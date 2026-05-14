import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Terminal | Seller Dashboard",
  description: "Manage your inventory, monitor performance, and drop new artifacts to the network.",
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
