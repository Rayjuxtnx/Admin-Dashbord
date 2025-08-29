'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Note: use the service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type ConfirmationStatus = 'pending' | 'verified' | 'invalid';

export async function getManualConfirmations() {
    const { data, error } = await supabase
        .from('manual_confirmations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching manual confirmations:', error);
        return [];
    }
    return data;
}

export async function updateConfirmationStatus(id: number, status: ConfirmationStatus) {
    const { error } = await supabase
        .from('manual_confirmations')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating confirmation status:', error);
        throw new Error('Failed to update confirmation status.');
    }

    revalidatePath('/manual-payments');
}
