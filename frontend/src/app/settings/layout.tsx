import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Protocols | Settings",
  description: "Configure your security, addresses, and account preferences.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
