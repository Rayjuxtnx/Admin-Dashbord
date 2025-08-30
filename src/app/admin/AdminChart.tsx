
"use client"

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

type SalesData = {
    amount: number;
    created_at: string;
}

export type ProcessedSalesData = {
    name: string;
    online: number;
    manual: number;
};

const chartConfig = {
  online: {
    label: "Online (STK)",
    color: "hsl(var(--primary))",
  },
  manual: {
    label: "Manual (Till)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

type AdminChartProps = {
    data: ProcessedSalesData[];
    isLoading: boolean;
}

export default function AdminChart({ data, isLoading }: AdminChartProps) {
  
  if(isLoading) {
    return <Skeleton className="w-full h-[350px]" />
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            />
            <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Ksh ${value}`}
            />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                    formatter={(value, name) => {
                        return (
                            <div className="flex flex-col">
                                <span className='font-bold'>{`Ksh ${Number(value).toLocaleString()}`}</span>
                            </div>
                        )
                    }}
                    indicator="dot" 
                />}
            />
            <Legend />
            <Bar
            dataKey="online"
            fill="var(--color-online)"
            radius={[4, 4, 0, 0]}
            />
            <Bar
            dataKey="manual"
            fill="var(--color-manual)"
            radius={[4, 4, 0, 0]}
            />
        </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
