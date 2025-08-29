'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Note: use the service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getMenuItems() {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) {
        console.error("Error fetching menu items:", error);
        return []
    }
    return data;
};

export async function deleteMenuItem(id: string) {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
        console.error("Error deleting item:", error);
        throw new Error("Failed to delete menu item.");
    }
    revalidatePath('/menu');
};

export async function upsertMenuItem(formData: FormData, id?: string) {
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;

    const record = { name, price, description };

    let error;
    if (id) {
        // Update
        const result = await supabase.from('menu_items').update(record).eq('id', id);
        error = result.error;
    } else {
        // Create
        const result = await supabase.from('menu_items').insert(record);
        error = result.error;
    }

    if (error) {
        console.error("Error upserting item:", error);
        throw new Error("Failed to upsert menu item.");
    }

    revalidatePath('/menu');
}
