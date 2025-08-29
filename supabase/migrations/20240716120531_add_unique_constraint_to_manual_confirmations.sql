-- Add a unique constraint to the mpesa_code column to prevent duplicate submissions
ALTER TABLE public.manual_confirmations
ADD CONSTRAINT manual_confirmations_mpesa_code_key UNIQUE (mpesa_code);
