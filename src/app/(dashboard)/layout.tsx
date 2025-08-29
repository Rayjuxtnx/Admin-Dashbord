import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardAppLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
