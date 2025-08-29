import { BookCopy, Newspaper, UtensilsCrossed } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentPayments } from "@/components/dashboard/recent-payments";

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
        <header>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
                Here's a quick look at your restaurant's performance.
            </p>
        </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Menu Items" value="75" icon={UtensilsCrossed} description="+2 this month" />
        <StatCard title="Active Reservations" value="12" icon={BookCopy} description="+5 from last week" />
        <StatCard title="Blog Posts" value="23" icon={Newspaper} description="1 new post" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <OverviewChart />
        </div>
        <div>
            <RecentPayments />
        </div>
      </div>
    </div>
  );
}
