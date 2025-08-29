'use client';

import { BookCopy, Newspaper, UtensilsCrossed } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function OverviewPage() {
  const [menuItemsCount, setMenuItemsCount] = useState<number | string>("...");
  const [reservationsCount, setReservationsCount] = useState<number | string>("...");

  useEffect(() => {
    const fetchCounts = async () => {
      // Fetch menu items count
      const { count: menuCount, error: menuError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true });

      if (!menuError) {
        setMenuItemsCount(menuCount ?? 0);
      } else {
        console.error("Error fetching menu items count:", menuError);
        setMenuItemsCount("N/A");
      }

      // Fetch active reservations count
      const { count: reservationsCount, error: reservationsError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Paid', 'Pending']);
        
      if (!reservationsError) {
        setReservationsCount(reservationsCount ?? 0);
      } else {
        console.error("Error fetching reservations count:", reservationsError);
        setReservationsCount("N/A");
      }
    };

    fetchCounts();

    const menuChanges = supabase
      .channel('table-db-changes-menu_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, 
        (payload) => fetchCounts()
      )
      .subscribe();

    const reservationChanges = supabase
      .channel('table-db-changes-reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, 
        (payload) => fetchCounts()
      )
      .subscribe();

    return () => {
        supabase.removeChannel(menuChanges);
        supabase.removeChannel(reservationChanges);
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
