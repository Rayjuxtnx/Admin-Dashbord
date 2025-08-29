'use client';

import { BookCopy, UtensilsCrossed } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Landmark } from "lucide-react";
import AdminChart from "@/components/dashboard/admin-chart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getDashboardCounts } from "./actions";

export default function OverviewPage() {
  const [menuItemsCount, setMenuItemsCount] = useState<number | string>("...");
  const [reservationsCount, setReservationsCount] = useState<number | string>("...");
  const [totalPayments, setTotalPayments] = useState<number | string>("...");

  useEffect(() => {
    const fetchCounts = async () => {
      setMenuItemsCount("...");
      setReservationsCount("...");
      setTotalPayments("...");

      // The menu count is temporarily disabled until the menu table is created.
      setMenuItemsCount(0); 

      const { reservationsCount: resCount, totalPayments: totalRev } = await getDashboardCounts();
      setReservationsCount(resCount);
      setTotalPayments(totalRev);
    };

    fetchCounts();

    const reservationChanges = supabase
      .channel('table-db-changes-reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, 
        (payload) => fetchCounts()
      )
      .subscribe();
      
    const paymentChanges = supabase
      .channel('table-db-changes-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, 
        (payload) => fetchCounts()
      )
      .subscribe();

    return () => {
        supabase.removeChannel(reservationChanges);
        supabase.removeChannel(paymentChanges);
    };
  }, []);


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
        <StatCard title="Total Menu Items" value={menuItemsCount.toString()} icon={UtensilsCrossed} description="Live count from database" />
        <StatCard title="Active Reservations" value={reservationsCount.toString()} icon={BookCopy} description="Paid & Pending" />
        <StatCard title="Total Verified Revenue" value={totalPayments.toString()} icon={Landmark} description="From all verified payments" />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Sales Overview</CardTitle>
                    <CardDescription>Online vs. Manual Payments</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdminChart />
                </CardContent>
            </Card>
        </div>
        <div>
            <RecentPayments />
        </div>
      </div>
    </div>
  );
}
