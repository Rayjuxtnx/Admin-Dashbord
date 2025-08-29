"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { subDays, format } from "date-fns";

const chartConfig = {
  payments: {
    label: "Payments",
    color: "hsl(var(--primary))",
  },
};

type ChartData = {
  date: string;
  payments: number;
}

export function OverviewChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i));
      
      const { data, error } = await supabase
        .from('payments')
        .select('date, amount')
        .eq('status', 'Verified')
        .gte('date', format(subDays(today, 6), 'yyyy-MM-dd'));

      if (error) {
        console.error("Error fetching sales data:", error);
        return;
      }
      
      const dailyTotals = last7Days.map(date => {
        const formattedDate = format(date, 'MMM d');
        const total = data
          .filter(p => format(new Date(p.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
          .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.-]+/g,"") || '0'), 0);
        return { date: formattedDate, payments: total };
      }).reverse();

      setChartData(dailyTotals);
    };

    fetchSalesData();
    
    const channel = supabase
      .channel('realtime overview-chart')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchSalesData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline">Sales Overview</CardTitle>
        <CardDescription>Verified payments over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `KES ${Number(value) / 1000}k`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="payments" fill="var(--color-payments)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
