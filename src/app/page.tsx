import { DashboardLayout } from "@/components/layout/dashboard-layout";
import AdminDashboardPage from "./(dashboard)/page";

export default function Home() {
  return (
    <DashboardLayout>
      <AdminDashboardPage />
    </DashboardLayout>
  );
}
