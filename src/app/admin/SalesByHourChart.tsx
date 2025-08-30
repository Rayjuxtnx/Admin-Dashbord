
"use client"

import { useMemo } from 'react';
import { Area, Bar, ComposedChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from "recharts"
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useIsMobile } from '@/hooks/use-mobile';

export type ProcessedSalesByHourData = {
    hour: string;
    sales: number;
    cumulative: number;
};

const chartConfig = {
  sales: {
    label: "Hourly Sales",
    color: "hsl(var(--primary))",
  },
  cumulative: {
    label: "Cumulative Sales",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

type SalesByHourChartProps = {
    data: ProcessedSalesByHourData[];
    isLoading: boolean;
}

export default function SalesByHourChart({ data, isLoading }: SalesByHourChartProps) {
  const isMobile = useIsMobile();
  
  if(isLoading) {
    return <Skeleton className="w-full h-[350px]" />
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="hour"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={isMobile ? 3 : 0} 
            />
            <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Ksh ${Number(value).toLocaleString()}`}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent
                    formatter={(value, name) => {
                        return `Ksh ${Number(value).toLocaleString()}`;
                    }}
                    indicator="dot" 
                />}
            />
            <Legend />
            <Bar
                dataKey="sales"
                fill="var(--color-sales)"
                radius={[4, 4, 0, 0]}
            />
            <Line
                type="monotone"
                dataKey="cumulative"
                stroke="var(--color-cumulative)"
                strokeWidth={2}
                dot={false}
            />
        </ComposedChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}

    