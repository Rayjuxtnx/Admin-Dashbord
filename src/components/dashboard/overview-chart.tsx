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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "March", mpesa: 1860, till: 800 },
  { month: "April", mpesa: 3050, till: 2000 },
  { month: "May", mpesa: 2370, till: 1200 },
  { month: "June", mpesa: 1730, till: 2600 },
  { month: "July", mpesa: 2090, till: 1400 },
  { month: "August", mpesa: 2140, till: 2900 },
];

const chartConfig = {
  mpesa: {
    label: "M-Pesa STK",
    color: "hsl(var(--primary))",
  },
  till: {
    label: "Till",
    color: "hsl(var(--accent))",
  },
};

export function OverviewChart() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline">Sales Overview</CardTitle>
        <CardDescription>Online vs. Manual Payments - Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
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
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="mpesa" fill="var(--color-mpesa)" radius={4} />
            <Bar dataKey="till" fill="var(--color-till)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
