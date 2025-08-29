
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { serve } from '@supabase/functions-js'

// Define the structure of the M-Pesa callback payload
interface MpesaCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: {
          Name: string;
          Value: string | number;
        }[];
      };
    };
  };
}

// Define the structure of the data to be inserted into Supabase
interface PaymentRecord {
    merchant_request_id: string;
    checkout_request_id: string;
    result_code: number;
    result_desc: string;
    amount?: number;
    mpesa_receipt_number?: string;
    transaction_date?: string;
    phone_number?: string;
    raw_payload: any;
}

const createServiceRoleClient = (): SupabaseClient => {
  // These are set in the Supabase Dashboard -> Edge Functions -> your_function -> Settings
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase URL or Service Role Key is missing from environment variables.');
    throw new Error('Supabase environment variables are not set.');
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};


serve(async (req) => {
  if (req.method !== 'POST') {
    console.log('Received non-POST request. Method:', req.method);
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload: MpesaCallbackPayload = await req.json();
    console.log('Received M-Pesa callback payload:', JSON.stringify(payload, null, 2));

    const { stkCallback } = payload.Body;
    const supabaseAdmin = createServiceRoleClient();


    const paymentRecord: PaymentRecord = {
        merchant_request_id: stkCallback.MerchantRequestID,
        checkout_request_id: stkCallback.CheckoutRequestID,
        result_code: stkCallback.ResultCode,
        result_desc: stkCallback.ResultDesc,
        raw_payload: payload, // Store the entire payload for debugging
    };
    
    // If payment was successful, parse metadata and update reservation
    if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
        console.log('Payment successful. Parsing metadata.');
        const metadata = stkCallback.CallbackMetadata.Item;
        const amountItem = metadata.find(item => item.Name === 'Amount');
        const receiptItem = metadata.find(item => item.Name === 'MpesaReceiptNumber');
        const dateItem = metadata.find(item => item.Name === 'TransactionDate');
        const phoneItem = metadata.find(item => item.Name === 'PhoneNumber');

        if(amountItem) paymentRecord.amount = Number(amountItem.Value);
        if(receiptItem) paymentRecord.mpesa_receipt_number = String(receiptItem.Value);
        if(phoneItem) paymentRecord.phone_number = String(phoneItem.Value);
        
        if (dateItem && dateItem.Value) {
            const txDate = String(dateItem.Value); // e.g., 20231027153045
            const year = txDate.substring(0, 4);
            const month = txDate.substring(4, 6);
            const day = txDate.substring(6, 8);
            const hour = txDate.substring(8, 10);
            const minute = txDate.substring(10, 12);
            const second = txDate.substring(12, 14);
            // Format to ISO 8601 string
            paymentRecord.transaction_date = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
        }

        // ---- CRUCIAL STEP: Update the reservation status ----
        console.log(`Updating reservation with CheckoutRequestID: ${stkCallback.CheckoutRequestID}`);
        const { data: updateData, error: updateError } = await supabaseAdmin
            .from('reservations')
            .update({ payment_status: 'paid' })
            .eq('checkout_request_id', stkCallback.CheckoutRequestID)
            .select();

        if (updateError) {
            console.error('Error updating reservation status:', updateError);
        } else {
            console.log('Successfully updated reservation status:', updateData);
        }
        // ----------------------------------------------------

    } else {
        console.log(`Payment was not successful. ResultCode: ${stkCallback.ResultCode}, ResultDesc: ${stkCallback.ResultDesc}`);
    }

    console.log('Attempting to insert record into Supabase payments table:', JSON.stringify(paymentRecord, null, 2));

    // Insert data into the 'payments' table
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([paymentRecord])
      .select();

    if (error) {
      console.error('Supabase insert error into payments table:', error);
    } else {
      console.log('Successfully inserted into payments table:', data);
    }

    // Always respond to Safaricom API to acknowledge receipt
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Critical error in callback handler:', err.message, err.stack);
    // Respond with success to prevent Safaricom from retrying on a fatal error.
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  }
})
