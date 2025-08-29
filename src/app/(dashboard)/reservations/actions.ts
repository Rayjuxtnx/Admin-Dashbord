'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Note: use the service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Reservation = {
  id: string
  customer: string
  date: string
  time: string
  guests: number
  preorder: string
  requests: string
  status: 'Paid' | 'Pending' | 'Cancelled'
}

export async function getReservations() {
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching reservations:', error)
        return [];
    }
    return data;
}

export async function updateReservationStatus(id: string, status: Reservation['status']) {
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    if (error) {
        console.error('Error updating reservation status:', error);
        throw new Error('Failed to update reservation status.');
    }
    revalidatePath('/reservations');
}

export async function deleteReservation(id: string) {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) {
        console.error('Error deleting reservation:', error);
        throw new Error('Failed to delete reservation.');
    }
    revalidatePath('/reservations');
}
