'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Note: use the service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type PreOrderItem = {
    name: string;
    price: string;
}

type ReservationStatus = 'pending' | 'paid' | 'not_paid' | 'cancelled';

export type Reservation = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  guests: number;
  reservation_date: string;
  reservation_time: string;
  special_requests: string | null;
  pre_ordered_items: PreOrderItem[] | null;
  pre_order_total: number;
  payment_status: ReservationStatus;
  checkout_request_id: string | null;
};


export async function getReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reservations:', error)
        return [];
    }
    return data as Reservation[];
}

export async function updateReservationStatus(id: number, status: ReservationStatus) {
    const { error } = await supabase.from('reservations').update({ payment_status: status }).eq('id', id);
    if (error) {
        console.error('Error updating reservation status:', error);
        throw new Error('Failed to update reservation status.');
    }
    revalidatePath('/reservations');
}

export async function deleteReservation(id: number) {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) {
        console.error('Error deleting reservation:', error);
        throw new Error('Failed to delete reservation.');
    }
    revalidatePath('/reservations');
}
