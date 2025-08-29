'use server';
/**
 * @fileOverview A flow for handling M-Pesa STK push payments.
 * 
 * - triggerSTKPush - A function that initiates the STK push process.
 * - StkPushInput - The input type for the triggerSTKPush function.
 * - StkPushOutput - The return type for the triggerSTKPush function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import 'dotenv/config';

// Define input and output schemas
const StkPushInputSchema = z.object({
    phone: z.string().describe("The customer's phone number"),
    amount: z.number().describe("The amount to be paid"),
});
export type StkPushInput = z.infer<typeof StkPushInputSchema>;

const StkPushOutputSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
});
export type StkPushOutput = z.infer<typeof StkPushOutputSchema>;

// Exported function to be called from the frontend
export async function triggerSTKPush(input: StkPushInput): Promise<StkPushOutput> {
  return await mpesaStkPushFlow(input);
}

// Helper function to get Daraja API access token
const getAccessToken = async (): Promise<string> => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = 'Basic ' + Buffer.from(consumerKey + ':' + consumerSecret).toString('base64');
    
    const response = await fetch(url, {
        headers: {
            'Authorization': auth
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
};

// The main Genkit flow
const mpesaStkPushFlow = ai.defineFlow(
  {
    name: 'mpesaStkPushFlow',
    inputSchema: StkPushInputSchema,
    outputSchema: StkPushOutputSchema,
  },
  async (input) => {
    try {
        const token = await getAccessToken();
        const shortCode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;

        if (!shortCode || !passkey) {
            throw new Error("M-Pesa shortcode or passkey is not configured in .env file.");
        }
        
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(shortCode + passkey + timestamp).toString('base64');
        
        const callbackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mpesa-callback`;

        const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
        const payload = {
            "BusinessShortCode": shortCode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": input.amount,
            "PartyA": input.phone,
            "PartyB": shortCode,
            "PhoneNumber": input.phone,
            "CallBackURL": callbackUrl,
            "AccountReference": "Hidden tasty grill",
            "TransactionDesc": "Payment for Hidden tasty grill order"
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();

        if (response.ok && responseData.ResponseCode === "0") {
            return {
                success: true,
                message: responseData.ResponseDescription || 'STK push initiated successfully.',
                data: responseData
            };
        } else {
             return {
                success: false,
                message: responseData.errorMessage || 'Failed to initiate STK push.',
                data: responseData
            };
        }

    } catch (error: any) {
      console.error("STK Push Flow Error:", error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred.',
      };
    }
  }
);
