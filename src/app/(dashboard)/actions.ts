
'use server'

import 'dotenv/config';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { revalidatePath } from "next/cache";
import type { MenuItem } from '@/lib/menuData';
import type { BlogPost } from '@/lib/blogStore';


// Initialize the Supabase client once for all functions in this file
const supabase = createServiceRoleClient();

async function ensureBucketExists(bucketName: string) {
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
  const purpose = formData.get('purpose') as 'homepage_hero' | 'gallery';


  if (!file) {
    throw new Error('No file provided');
  }
  
  await ensureBucketExists(bucket);

  const filePath = `${purpose}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

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
    purpose: purpose || 'gallery',
  };

  const { data: dbData, error: dbError } = await supabase
    .from('gallery')
    .insert(metadata)
    .select()
    .single();

  if (dbError) {
    console.error('Database Insert Error:', dbError);
    await supabase.storage.from(bucket).remove([uploadData.path]);
    throw new Error('Failed to save media metadata to the database.', { cause: dbError });
  }

  console.log('Successfully uploaded and saved:', dbData);
  
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/gallery');
  revalidatePath('/video-gallery');
  revalidatePath('/homepage-media');


  return dbData;
}


export async function getGalleryMedia() {
    const { data, error } = await supabase
        .from('gallery')
        .select('id, url, type, alt_text, purpose, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching gallery media:", error);
        return [];
    }
    return data;
}

export async function deleteGalleryMedia(id: number, path: string) {
    const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

    if (dbError) {
        console.error("Error deleting media from database:", dbError);
        throw new Error("Failed to delete media from database.");
    }
    
    const { error: storageError } = await supabase.storage
        .from('media')
        .remove([path]);
        
    if (storageError) {
        console.error("Error deleting media from storage:", storageError);
        // Don't throw, as the DB entry is already gone. Log it for manual cleanup.
    }

    revalidatePath('/gallery');
    revalidatePath('/video-gallery');
    revalidatePath('/homepage-media');
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
        .select('amount, created_at') // use created_at instead of date
        .eq('type', 'online');

    if (onlineError) {
        console.error('Error fetching online sales data:', onlineError);
        return { onlineSales: [], manualSales: [] };
    }

    // Fetch verified manual payments from the new table
    const { data: manualSales, error: manualError } = await supabase
        .from('payments')
        .select('amount, created_at') // use created_at instead of date
        .eq('type', 'manual');

    if (manualError) {
        console.error('Error fetching manual sales data:', manualError);
        return { onlineSales: (onlineSales || []).map(d => ({...d, amount: parseAmount(d.amount), created_at: d.created_at})), manualSales: [] };
    }

    return { 
        onlineSales: (onlineSales || []).map(d => ({...d, amount: parseAmount(d.amount), created_at: d.created_at})), 
        manualSales: (manualSales || []).map(d => ({...d, amount: parseAmount(d.amount), created_at: d.created_at}))
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

    const { count: publishedBlogsCount, error: blogsError } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

    if (blogsError) {
        console.error('Error fetching blogs count:', blogsError);
    }
    
    const { count: videosCount, error: videosError } = await supabase
        .from('gallery')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'video')
        .eq('purpose', 'homepage_hero');
        
    if (videosError) {
        console.error('Error fetching videos count:', videosError);
    }


    return {
        reservationsCount: reservationsCount ?? 0,
        totalPayments,
        publishedBlogsCount: publishedBlogsCount ?? 0,
        videosCount: videosCount ?? 0,
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


// Server actions for menu items
export async function getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching menu items:", error);
        if (error.message.includes("relation \"menu_items\" does not exist")) {
             throw new Error("The 'menu_items' table does not exist in your database. Please create it first in the Supabase dashboard.");
        }
        throw new Error("Failed to fetch menu items from the database.");
    }
    return data as MenuItem[];
};

export async function upsertMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const itemToUpsert = {
    ...item,
    slug: item.name?.toLowerCase().replace(/\s+/g, '-') || `item-${Date.now()}`
  };
  
  // If 'id' is present and it's a new temporary id, remove it before insertion
  if (itemToUpsert.id && String(itemToUpsert.id).startsWith('new-')) {
    delete itemToUpsert.id;
  }
  
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(itemToUpsert)
    .select()
    .single();

  if (error) {
    console.error("Error upserting menu item:", error);
    throw new Error(`Failed to save menu item. Reason: ${error.message}`);
  }

  revalidatePath('/');
  revalidatePath('/menu');
  return data as MenuItem;
}

export async function deleteMenuItem(itemId: string) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error("Error deleting menu item:", error);
    throw new Error("Failed to delete menu item.");
  }
  
  revalidatePath('/');
  revalidatePath('/menu');
  return;
}

// Server actions for blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching blog posts:", error);
        throw new Error("Failed to fetch blog posts.");
    }
    return data as BlogPost[];
};

export async function upsertBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
  const postToUpsert = { ...post };
  
  if (postToUpsert.id && String(postToUpsert.id).startsWith('new-')) {
    delete postToUpsert.id;
  }
  
  const { data, error } = await supabase
    .from('blogs')
    .upsert(postToUpsert)
    .select()
    .single();

  if (error) {
    console.error("Error upserting blog post:", error);
    throw new Error(`Failed to save blog post. Reason: ${error.message}`);
  }

  revalidatePath('/blogs');
  return data as BlogPost;
}

export async function deleteBlogPost(postId: number): Promise<void> {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error("Error deleting blog post:", error);
    throw new Error("Failed to delete blog post.");
  }
  
  revalidatePath('/blogs');
  return;
}
