import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Identity | Synthetix",
  description: "Manage your profile, view your acquisitions, and refine your aesthetic matrix.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
