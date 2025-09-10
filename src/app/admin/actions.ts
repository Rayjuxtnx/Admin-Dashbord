

'use server'

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
import type { MenuItem } from '@/lib/menuData';
import type { Post } from '@/lib/postStore';

// Note: use the service role key to bypass RLS
const createServiceRoleClient = () => {
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

async function ensureBucketExists(bucketName: string) {
    const supabase = createServiceRoleClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error);
        throw new Error("Could not list Supabase storage buckets.");
    }
    
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
        console.log(`Bucket '${bucketName}' not found. Creating it.`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true, 
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
  const supabase = createServiceRoleClient();


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
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
        .from('gallery')
        .select('id, url, type, alt_text, purpose, created_at, path')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching gallery media:", error);
        return [];
    }
    return data;
}

export async function deleteGalleryMedia(id: number, path: string) {
    const supabase = createServiceRoleClient();
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
    }

    revalidatePath('/gallery');
    revalidatePath('/video-gallery');
    revalidatePath('/homepage-media');
    revalidatePath('/admin');
}

export async function getRecentPayments() {
  const supabase = createServiceRoleClient();
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

const parseAmount = (amount: any): number => {
    if (amount === null || amount === undefined) return 0;
    if (typeof amount === 'number') return amount;
    const num = parseFloat(String(amount).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
}

export async function getSalesDataForChart() {
    const supabase = createServiceRoleClient();
    
    // Fetch online payments from 'payments' table
    const { data: onlinePayments, error: onlineError } = await supabase
        .from('payments')
        .select('amount, created_at');

    if (onlineError) {
        console.error('Error fetching online payments:', onlineError);
        return [];
    }
    
    // Fetch verified manual payments from 'manual_till_payments' table
    const { data: manualPayments, error: manualError } = await supabase
        .from('manual_till_payments')
        .select('amount, created_at')
        .eq('status', 'verified');
        
    if (manualError) {
        console.error('Error fetching manual payments:', manualError);
        return [];
    }

    // Combine and process data
    const allSales = [
        ...(onlinePayments || []).map(p => ({ ...p, type: 'online' })),
        ...(manualPayments || []).map(p => ({ ...p, type: 'manual' }))
    ];

    const monthlyTotals: { [key: string]: { name: string, online: number, manual: number, monthIndex: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    allSales.forEach(sale => {
        if (!sale.created_at || isNaN(new Date(sale.created_at).getTime())) return; 

        const saleDate = new Date(sale.created_at);
        const monthIndex = saleDate.getMonth();
        const year = saleDate.getFullYear();
        const key = `${year}-${String(monthIndex).padStart(2, '0')}`; // Key like "2024-07"
        const amount = parseAmount(sale.amount);

        if (!monthlyTotals[key]) {
            monthlyTotals[key] = { name: monthNames[monthIndex], online: 0, manual: 0, monthIndex };
        }

        if (sale.type === 'online') {
            monthlyTotals[key].online += amount;
        } else if (sale.type === 'manual') {
            monthlyTotals[key].manual += amount;
        }
    });

    return Object.values(monthlyTotals)
        .sort((a, b) => a.monthIndex - b.monthIndex)
        .map(({ name, online, manual }) => ({ name, online, manual }));
};

export async function getSalesDataForDayChart() {
    const supabase = createServiceRoleClient();
    
    // Get start and end of today in UTC
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Fetch online payments from 'payments' table for today
    const { data: onlinePayments, error: onlineError } = await supabase
        .from('payments')
        .select('amount, created_at')
        .gte('created_at', startOfToday.toISOString())
        .lte('created_at', endOfToday.toISOString());

    if (onlineError) {
        console.error('Error fetching today\'s online payments:', onlineError);
        return [];
    }
    
    // Fetch verified manual payments from 'manual_till_payments' table for today
    const { data: manualPayments, error: manualError } = await supabase
        .from('manual_till_payments')
        .select('amount, created_at')
        .eq('status', 'verified')
        .gte('created_at', startOfToday.toISOString())
        .lte('created_at', endOfToday.toISOString());
        
    if (manualError) {
        console.error('Error fetching today\'s manual payments:', manualError);
        return [];
    }

    const allSales = [...(onlinePayments || []), ...(manualPayments || [])];
    
    const hourlyTotals: { [key: number]: number } = {};
    for (let i = 0; i < 24; i++) {
        hourlyTotals[i] = 0;
    }

    allSales.forEach(sale => {
        if (!sale.created_at || isNaN(new Date(sale.created_at).getTime())) return;
        const saleDate = new Date(sale.created_at);
        const hour = saleDate.getHours();
        const amount = parseAmount(sale.amount);
        hourlyTotals[hour] += amount;
    });

    const chartData = [];
    let cumulativeTotal = 0;
    for (let i = 0; i < 24; i++) {
        const sales = hourlyTotals[i];
        cumulativeTotal += sales;
        chartData.push({
            hour: `${i}:00`,
            sales: sales,
            cumulative: cumulativeTotal,
        });
    }

    return chartData;
}


export async function getDashboardCounts() {
    const supabase = createServiceRoleClient();
    
    const { count: reservationsCount, error: reservationsError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });
    
    if (reservationsError) console.error('Error fetching reservations count:', reservationsError);

    const { data: onlinePayments, error: onlineError } = await supabase
        .from('payments')
        .select('amount');

    if (onlineError) console.error("Error fetching online payments:", onlineError);
    
    const { data: manualPayments, error: manualError } = await supabase
        .from('manual_till_payments')
        .select('amount')
        .eq('status', 'verified');
    
    if (manualError) console.error("Error fetching manual payments:", manualError);

    const onlineTotal = onlinePayments?.reduce((sum, p) => sum + parseAmount(p.amount), 0) ?? 0;
    const manualTotal = manualPayments?.reduce((sum, p) => sum + parseAmount(p.amount), 0) ?? 0;
    
    const totalAmount = onlineTotal + manualTotal;
    
    const totalRevenue = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(totalAmount);

    const { count: publishedPostsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

    if (postsError) console.error('Error fetching posts count:', postsError);
    
    const { count: videosCount, error: videosError } = await supabase
        .from('gallery')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'video')
        .eq('purpose', 'gallery');
        
    if (videosError) console.error('Error fetching videos count:', videosError);

    const { count: pendingManualPayments, error: pendingError } = await supabase
        .from('manual_till_payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
    
    if (pendingError) console.error('Error fetching pending manual payments count:', pendingError);

    return {
        reservationsCount: reservationsCount ?? 0,
        totalRevenue,
        publishedPostsCount: publishedPostsCount ?? 0,
        videosCount: videosCount ?? 0,
        pendingManualPayments: pendingManualPayments ?? 0,
    };
}


export async function getReservations() {
  const supabase = createServiceRoleClient();
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
    const supabase = createServiceRoleClient();
    const { error } = await supabase
        .from('reservations')
        .update({ payment_status: status })
        .eq('id', id);

    if (error) {
        console.error("Error updating reservation status:", error);
        throw new Error("Could not update reservation status.");
    }
    revalidatePath('/admin');
}

export async function deleteReservation(id: number) {
    const supabase = createServiceRoleClient();
    const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting reservation:", error);
        throw new Error("Could not delete reservation.");
    }
    revalidatePath('/admin');
}

export async function submitManualPaymentConfirmation(formData: { name: string; phone: string; mpesaCode: string; amount: number; paymentTime: string; }) {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
        .from('manual_till_payments')
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
        if (error.code === '23505') { 
             throw new Error("This M-Pesa code has already been submitted. Please check the code and try again.");
        }
        throw new Error("Could not submit your payment confirmation. Please try again.");
    }
    revalidatePath('/payment-confirmation');
    revalidatePath('/admin');
    return data;
}

export async function getManualConfirmations() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('manual_till_payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching manual payment confirmations:", error);
    return [];
  }
  return data;
}

export async function updateConfirmationStatus(id: number, status: 'verified' | 'pending' | 'invalid') {
    const supabase = createServiceRoleClient();
    
    // First, check if we are verifying and if the payment already exists in the main table to prevent duplicates
    if (status === 'verified') {
        const { data: confirmation } = await supabase
            .from('manual_till_payments')
            .select('*')
            .eq('id', id)
            .single();

        if (confirmation) {
            const { count: existingPaymentCount, error: checkError } = await supabase
                .from('payments')
                .select('*', { count: 'exact', head: true })
                .eq('mpesa_receipt_number', confirmation.mpesa_code);

            if (checkError) {
                console.error("Error checking for existing payment:", checkError);
                throw new Error("Could not verify payment due to a database error.");
            }

            if (existingPaymentCount === 0) {
                 const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                        amount: confirmation.amount,
                        type: 'manual', 
                        phone_number: confirmation.customer_phone,
                        raw_payload: confirmation, 
                        mpesa_receipt_number: confirmation.mpesa_code,
                        created_at: confirmation.created_at || new Date().toISOString(),
                    });
                if (paymentError) {
                     console.error("Error inserting into payments table after verification:", paymentError);
                     throw new Error("Could not save the verified payment.");
                }
            } else {
                console.warn(`Payment with M-Pesa code ${confirmation.mpesa_code} already exists in the payments table. Skipping insertion.`);
            }
        }
    }

    // Now, update the status in the manual_till_payments table
    const { error } = await supabase
        .from('manual_till_payments')
        .update({ status: status })
        .eq('id', id);

    if (error) {
        console.error("Error updating confirmation status:", error);
        throw new Error("Could not update confirmation status.");
    }
    
    revalidatePath('/admin');
}

export async function getTopSellingMenuItems() {
    const supabase = createServiceRoleClient();
    const { data: reservations, error } = await supabase
        .from('reservations')
        .select('pre_ordered_items');

    if (error) {
        console.error("Error fetching reservations for top items chart:", error);
        return [];
    }

    const itemCounts: { [key: string]: number } = {};

    reservations.forEach(reservation => {
        if (Array.isArray(reservation.pre_ordered_items)) {
            reservation.pre_ordered_items.forEach((item: any) => {
                if (item && typeof item.name === 'string') {
                    itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
                }
            });
        }
    });

    const sortedItems = Object.entries(itemCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Get top 10 items

    return sortedItems;
}


export async function getMenuItems(): Promise<MenuItem[]> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching menu items:", error);
        if (error.message.includes("does not exist")) {
             throw new Error("The 'menu_items' table does not exist in your database. Please create it first in the Supabase dashboard.");
        }
        throw new Error("Failed to fetch menu items from the database.");
    }
    return data as MenuItem[];
};

export async function upsertMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const supabase = createServiceRoleClient();
  const { id, ...itemToUpsert } = {
    ...item,
    slug: item.name?.toLowerCase().replace(/\s+/g, '-') || `item-${Date.now()}`
  };
  
  // If the item has an ID, it's an update. If not, it's an insert.
  const query = id 
    ? supabase.from('menu_items').update(itemToUpsert).eq('id', id)
    : supabase.from('menu_items').insert({ ...itemToUpsert });
  
  const { data, error } = await query
    .select()
    .single();

  if (error) {
    console.error("Error upserting menu item:", error);
    throw new Error(`Failed to save menu item. Reason: ${error.message}`);
  }

  revalidatePath('/menu');
  revalidatePath('/admin');
  return data as MenuItem;
}

export async function deleteMenuItem(itemId: string) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error("Error deleting menu item:", error);
    throw new Error("Failed to delete menu item.");
  }
  
  revalidatePath('/menu');
  revalidatePath('/admin');
  return;
}

export async function getPosts(): Promise<Post[]> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
        if (error.message.includes("does not exist")) {
             throw new Error("The 'posts' table does not exist in your database. Please create it first in the Supabase dashboard.");
        }
        throw new Error("Failed to fetch posts.");
    }
    return data as Post[];
};

export async function upsertPost(post: Partial<Post>): Promise<Post> {
  const supabase = createServiceRoleClient();
  
  const { id, ...postToUpsert } = { 
    ...post,
    slug: post.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || `post-${Date.now()}`
  };
  
  // If the post has an ID, it's an update. If not, it's an insert.
  const query = post.id
    ? supabase.from('posts').update(postToUpsert).eq('id', post.id)
    : supabase.from('posts').insert(postToUpsert as any);
    
  const { data, error } = await query
    .select()
    .single();

  if (error) {
    console.error("Error upserting post:", error);
    throw new Error(`Failed to save post. Reason: ${error.message}`);
  }

  revalidatePath('/posts'); // Assuming you'll have a public posts page
  revalidatePath('/admin');
  return data as Post;
}

export async function deletePost(postId: number): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error("Error deleting post:", error);
    throw new Error("Failed to delete post.");
  }
  
  revalidatePath('/posts');
  revalidatePath('/admin');
  return;
}
