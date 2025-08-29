'use server';
/**
 * @fileOverview A flow for handling reservations and pre-orders.
 * 
 * - makeReservation - A function that saves reservation details and can trigger an STK push.
 * - ReservationInput - The input type for the makeReservation function.
 * - ReservationOutput - The return type for the makeReservation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { triggerSTKPush, StkPushInput } from './mpesaFlow';

const PreOrderItemSchema = z.object({
  name: z.string(),
  price: z.string(),
});

// Define input and output schemas
const ReservationInputSchema = z.object({
    name: z.string(),
    phone: z.string(),
    guests: z.number(),
    date: z.string(),
    time: z.string(),
    special_requests: z.string().optional(),
    pre_ordered_items: z.array(PreOrderItemSchema),
    pre_order_total: z.number(),
    should_pay: z.boolean(),
});
export type ReservationInput = z.infer<typeof ReservationInputSchema>;

const ReservationOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    reservationId: z.number().optional(),
    paymentResponse: z.any().optional(),
});
export type ReservationOutput = z.infer<typeof ReservationOutputSchema>;


// Exported function to be called from the frontend
export async function makeReservation(input: ReservationInput): Promise<ReservationOutput> {
  return await reservationFlow(input);
}

const normalizePhoneNumber = (phone: string): string => {
    if (phone.startsWith('+254')) {
      return phone.slice(1);
    }
    if (phone.startsWith('0')) {
      return '254' + phone.slice(1);
    }
    return phone;
};

// The main Genkit flow
const reservationFlow = ai.defineFlow(
  {
    name: 'reservationFlow',
    inputSchema: ReservationInputSchema,
    outputSchema: ReservationOutputSchema,
  },
  async (input) => {
    const supabase = createServiceRoleClient();
    let checkoutRequestId: string | undefined = undefined;

    try {
        // 1. If payment is requested, trigger STK push first
        let paymentResponse: any = null;
        if (input.should_pay && input.pre_order_total > 0) {
            const normalizedPhone = normalizePhoneNumber(input.phone);
            const stkInput: StkPushInput = {
                phone: normalizedPhone,
                amount: input.pre_order_total,
            };
            
            console.log("Triggering STK push with:", stkInput);
            paymentResponse = await triggerSTKPush(stkInput);
            console.log("STK push response:", paymentResponse);

            if (!paymentResponse.success) {
                return {
                    success: false,
                    message: paymentResponse.message || 'Failed to initiate M-Pesa payment.',
                };
            }
            checkoutRequestId = paymentResponse.data?.CheckoutRequestID;
        }

        // 2. Save the reservation to the database
        const reservationData = {
            name: input.name,
            phone: input.phone,
            guests: input.guests,
            reservation_date: new Date(input.date).toISOString(),
            reservation_time: input.time,
            special_requests: input.special_requests,
            pre_order_total: input.pre_order_total,
            payment_status: input.should_pay ? 'pending' : 'not_paid',
            pre_ordered_items: input.pre_ordered_items,
            checkout_request_id: checkoutRequestId,
        };
        
        console.log("Saving reservation to Supabase:", reservationData);

        const { data, error } = await supabase
            .from('reservations')
            .insert([reservationData])
            .select()
            .single();

        if (error) {
            console.error('Supabase reservation insert error:', error);
            // TODO: In a real app, you might want to try and cancel the payment if this fails.
            return {
                success: false,
                message: 'Your payment was initiated, but we failed to save the reservation. Please contact us.',
            };
        }
        
        console.log("Reservation saved successfully:", data);

        return {
            success: true,
            message: 'Reservation created successfully.',
            reservationId: data.id,
            paymentResponse: paymentResponse,
        };

    } catch (error: any) {
      console.error("Reservation Flow Error:", error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during reservation.',
      };
    }
  }
);
