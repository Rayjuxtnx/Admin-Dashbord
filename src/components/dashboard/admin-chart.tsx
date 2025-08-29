"use client"

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getSalesDataForChart } from '@/app/(dashboard)/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

type SalesData = {
    amount: number;
    date: string;
}

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

const processDataForChart = (onlineSales: SalesData[], manualSales: SalesData[]) => {
    const monthlyTotals = [
      { name: "Jan", online: 0, manual: 0 }, { name: "Feb", online: 0, manual: 0 },
      { name: "Mar", online: 0, manual: 0 }, { name: "Apr", online: 0, manual: 0 },
      { name: "May", online: 0, manual: 0 }, { name: "Jun", online: 0, manual: 0 },
      { name: "Jul", online: 0, manual: 0 }, { name: "Aug", online: 0, manual: 0 },
      { name: "Sep", online: 0, manual: 0 }, { name: "Oct", online: 0, manual: 0 },
      { name: "Nov", online: 0, manual: 0 }, { name: "Dec", online: 0, manual: 0 },
    ];

    onlineSales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const monthIndex = saleDate.getMonth();
        if (monthlyTotals[monthIndex]) {
            monthlyTotals[monthIndex].online += sale.amount;
        }
    });
    
    manualSales.forEach(sale => {
        const saleDate = new Date(sale.date);
        const monthIndex = saleDate.getMonth();
        if (monthlyTotals[monthIndex]) {
            monthlyTotals[monthIndex].manual += sale.amount;
        }
    });

    return monthlyTotals;
};

export default function AdminChart() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const { onlineSales, manualSales } = await getSalesDataForChart();
        const processedData = processDataForChart(onlineSales, manualSales);
        setData(processedData);
        setIsLoading(false);
    }
    fetchData();
  }, [])

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
