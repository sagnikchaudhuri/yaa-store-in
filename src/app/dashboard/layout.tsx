import type { ReactNode } from "react";
import DashboardProviders from "@/components/dashboard/DashboardProviders";

export const metadata = {
  title: "Dashboard — YAA Store",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardProviders>{children}</DashboardProviders>;
}
