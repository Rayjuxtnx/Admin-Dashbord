'use server';

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Note: use the service role key to bypass RLS
export const createServiceRoleClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        }
    );
}
