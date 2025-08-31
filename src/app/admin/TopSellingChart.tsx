
"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

export type TopSellingItemData = {
    name: string;
    count: number;
};

const chartConfig = {
  count: {
    label: "Times Ordered",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type TopSellingChartProps = {
    data: TopSellingItemData[];
    isLoading: boolean;
}

export default function TopSellingChart({ data, isLoading }: TopSellingChartProps) {
  
  if(isLoading) {
    return <Skeleton className="w-full h-[350px]" />
  }
  
  if (data.length === 0) {
    return (
        <div className="flex h-[350px] w-full items-center justify-center">
            <p className="text-muted-foreground">No pre-order data available to show top items.</p>
        </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={350}>
        <BarChart 
            data={data}
            layout="vertical"
            margin={{
                right: 16,
                left: 10,
            }}
        >
            <CartesianGrid horizontal={false} />
            <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={1}
                stroke="#888888"
                fontSize={12}
                className="truncate"
            />
            <XAxis
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent
                    formatter={(value) => `${value} orders`}
                    indicator="dot" 
                />}
            />
            <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={4}
            />
        </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
