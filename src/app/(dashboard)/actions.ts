'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Note: use the service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const parseAmount = (amount: string) => {
    if (!amount) return 0;
    return parseFloat(amount.replace(/[^0-9.-]+/g, "")) || 0;
}


export async function getSalesDataForChart() {
    const { data, error } = await supabase
        .from('payments')
        .select('amount, date, type');

    if (error) {
        console.error("Error fetching sales data:", error);
        return { onlineSales: [], manualSales: [] };
    }

    const sales = data.map(d => ({...d, created_at: d.date, amount: parseAmount(d.amount)}));

    const onlineSales = sales.filter(sale => sale.type === 'online');
    const manualSales = sales.filter(sale => sale.type === 'manual');
    
    return { onlineSales, manualSales };
}

export async function getDashboardCounts() {
    const { count: reservationsCount, error: reservationsError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });
    
    if (reservationsError) {
        console.error('Error fetching reservations count:', reservationsError);
    }
    
    const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount');

    let totalPayments = "N/A";
    if (!paymentsError) {
        const total = paymentsData.reduce((acc, payment) => {
            const amount = parseFloat(payment.amount.replace(/[^0-9.-]+/g,""));
            return acc + (isNaN(amount) ? 0 : amount);
        }, 0);
        totalPayments = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(total);
    } else {
        console.error("Error fetching payments:", paymentsError);
    }

    return {
        reservationsCount: reservationsCount ?? 0,
        totalPayments,
    };
}

export async function getRecentPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, created_at, customer_phone')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching recent payments:", error);
      return [];
    }

    return data.map(p => ({ ...p, amount: parseAmount(p.amount), phone_number: p.customer_phone }));
}
