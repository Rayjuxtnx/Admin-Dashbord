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
        .select('amount, date, type')
        .eq('status', 'Verified');

    if (error) {
        console.error("Error fetching sales data:", error);
        return { onlineSales: [], manualSales: [] };
    }

    const sales = data.map(d => ({...d, created_at: d.date, amount: parseAmount(d.amount)}));

    const onlineSales = sales.filter(sale => sale.type === 'online');
    const manualSales = sales.filter(sale => sale.type === 'manual');
    
    return { onlineSales, manualSales };
}