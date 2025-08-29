'use server'

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

// Note: use the service role key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ensureBucketExists(supabase: any, bucketName: string) {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error);
        throw new Error("Could not list Supabase storage buckets.");
    }
    
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
        console.log(`Bucket '${bucketName}' not found. Creating it.`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true, // Set to true so media URLs are publicly accessible
        });

        if (createError) {
            console.error(`Error creating bucket '${bucketName}':`, createError);
            throw new Error(`Could not create Supabase storage bucket: ${createError.message}`);
        }
        console.log(`Bucket '${bucketName}' created successfully.`);
    }
}


export async function uploadMedia(formData: FormData) {
  const file = formData.get('file') as File;
  const bucket = 'media';

  if (!file) {
    throw new Error('No file provided');
  }
  
  await ensureBucketExists(supabase, bucket);

  const filePath = `${Date.now()}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    throw new Error('Failed to upload file to Supabase Storage.', { cause: uploadError });
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(uploadData.path);
  
  if (!publicUrlData) {
      throw new Error('Failed to get public URL for the uploaded file.');
  }
  
  const publicUrl = publicUrlData.publicUrl;

  const metadata = {
    url: publicUrl,
    path: uploadData.path,
    type: file.type.startsWith('video') ? 'video' : 'image',
    alt_text: file.name,
    purpose: formData.get('purpose') as string || 'gallery',
  };

  const { data: dbData, error: dbError } = await supabase
    .from('gallery')
    .insert(metadata)
    .select();

  if (dbError) {
    console.error('Database Insert Error:', dbError);
    await supabase.storage.from(bucket).remove([uploadData.path]);
    throw new Error('Failed to save media metadata to the database.', { cause: dbError });
  }

  console.log('Successfully uploaded and saved:', dbData);
  
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/gallery');

  return dbData[0];
}

export async function getGalleryMedia() {
    const { data, error } = await supabase
        .from('gallery')
        .select('url, type, alt_text')
        .eq('purpose', 'gallery')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching gallery media:", error);
        return [];
    }
    return data;
}

export async function getRecentPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('phone_number, amount, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching recent payments:", error);
    return [];
  }
  return data.map(p => ({...p, phone_number: p.phone_number}));
}

const parseAmount = (amount: any) => {
    if (!amount) return 0;
    if (typeof amount === 'number') return amount;
    return parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
}

export async function getSalesDataForChart() {
    // Fetch online payments (STK push)
    const { data: onlineSales, error: onlineError } = await supabase
        .from('payments')
        .select('amount, date')
        .eq('type', 'online');

    if (onlineError) {
        console.error('Error fetching online sales data:', onlineError);
        return { onlineSales: [], manualSales: [] };
    }

    // Fetch verified manual payments from the new table
    const { data: manualSales, error: manualError } = await supabase
        .from('payments')
        .select('amount, date')
        .eq('type', 'manual');

    if (manualError) {
        console.error('Error fetching manual sales data:', manualError);
        return { onlineSales: (onlineSales || []).map(d => ({...d, amount: parseAmount(d.amount)})), manualSales: [] };
    }

    return { 
        onlineSales: (onlineSales || []).map(d => ({...d, amount: parseAmount(d.amount)})), 
        manualSales: (manualSales || []).map(d => ({...d, amount: parseAmount(d.amount)}))
    };
}

export async function getDashboardCounts() {
    const { count: reservationsCount, error: reservationsError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });
    
    if (reservationsError) {
        console.error('Error fetching reservations count:', reservationsError);
    }
    
    const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount');

    let totalPayments = "N/A";
    if (!paymentsError) {
        const total = paymentsData.reduce((acc, payment) => {
            const amount = parseFloat(String(payment.amount).replace(/[^0-9.-]+/g,""));
            return acc + (isNaN(amount) ? 0 : amount);
        }, 0);
        totalPayments = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(total);
    } else {
        console.error("Error fetching payments:", paymentsError);
    }

    return {
        reservationsCount: reservationsCount ?? 0,
        totalPayments,
    };
}


export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
  return data;
}

export async function updateReservationStatus(id: number, status: 'paid' | 'pending' | 'cancelled' | 'not_paid') {
    const { error } = await supabase
        .from('reservations')
        .update({ payment_status: status })
        .eq('id', id);

    if (error) {
        console.error("Error updating reservation status:", error);
        throw new Error("Could not update reservation status.");
    }
    revalidatePath('/reservations');
}

export async function deleteReservation(id: number) {
    const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting reservation:", error);
        throw new Error("Could not delete reservation.");
    }
    revalidatePath('/reservations');
}

export async function submitManualPaymentConfirmation(formData: { name: string; phone: string; mpesaCode: string; amount: number; paymentTime: string; }) {
    const { data, error } = await supabase
        .from('manual_confirmations')
        .insert({
            mpesa_code: formData.mpesaCode,
            customer_name: formData.name,
            customer_phone: formData.phone,
            amount: formData.amount,
            payment_time: formData.paymentTime,
            status: 'pending'
        });

    if (error) {
        console.error("Error submitting manual payment confirmation:", error);
        if (error.code === '23505') { // 23505 is the PostgreSQL error code for unique violation
             throw new Error("This M-Pesa code has already been submitted. Please check the code and try again.");
        }
        throw new Error("Could not submit your payment confirmation. Please try again.");
    }
    revalidatePath('/payment-confirmation');
    revalidatePath('/manual-payments');
    return data;
}

export async function getManualConfirmations() {
  const { data, error } = await supabase
    .from('manual_confirmations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching manual payment confirmations:", error);
    return [];
  }
  return data;
}

export async function updateConfirmationStatus(id: number, status: 'verified' | 'pending' | 'invalid') {
    const { error } = await supabase
        .from('manual_confirmations')
        .update({ status: status })
        .eq('id', id);

    if (error) {
        console.error("Error updating confirmation status:", error);
        throw new Error("Could not update confirmation status.");
    }
    revalidatePath('/manual-payments');
}

export async function getMenuItems() {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) {
        console.error("Error fetching menu items:", error);
        return [];
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
        const result = await supabase.from('menu_items').update(record).eq('id', id);
        error = result.error;
    } else {
        const result = await supabase.from('menu_items').insert(record);
        error = result.error;
    }

    if (error) {
        console.error("Error upserting item:", error);
        throw new Error("Failed to upsert menu item.");
    }

    revalidatePath('/menu');
}

export async function getHomepageMedia() {
    const { data, error } = await supabase
        .from('homepage_media')
        .select('id, value');

    if (error) {
        console.error("Error fetching homepage media:", error);
        return { heroImageUrl: null, heroVideoUrl: null };
    }
    
    if (!data) {
        return { heroImageUrl: null, heroVideoUrl: null };
    }

    const media: { [key: string]: string } = {};
    data.forEach(item => {
        media[item.id] = item.value;
    });

    return {
        heroImageUrl: media.hero_image_url || 'https://picsum.photos/1200/800?random=10',
        heroVideoUrl: media.hero_video_url || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    };
}

    