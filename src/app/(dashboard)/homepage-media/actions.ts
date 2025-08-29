'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    }
);

export async function uploadMedia(formData: FormData) {
    const file = formData.get('file') as File;
    const purpose = formData.get('purpose') as 'homepage_hero' | 'gallery';

    if (!file) {
        throw new Error('No file provided');
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${purpose}-${Date.now()}.${fileExtension}`;
    const filePath = `${purpose}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error('Failed to upload file to storage.');
    }

    const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
    const type = file.type.startsWith('video') ? 'video' : 'image';

    // Depending on the purpose, you might want to save the URL to a specific table.
    // For homepage hero, you could have a `homepage_media` table.
    if (purpose === 'homepage_hero') {
        const { error: dbError } = await supabase
            .from('homepage_media')
            .upsert({ id: type === 'image' ? 'hero_image_url' : 'hero_video_url', value: publicUrl }, { onConflict: 'id' });
        
        if (dbError) {
            console.error("Database update error:", dbError);
            throw new Error('Failed to save media URL to the database.');
        }
    }
    
    // For gallery, you might insert into a `gallery_videos` table.
    if (purpose === 'gallery') {
         const { error: dbError } = await supabase
            .from('gallery_videos')
            .insert({ src: publicUrl, type: type, title: file.name });

        if (dbError) {
            console.error("Database insert error:", dbError);
            throw new Error('Failed to save gallery media URL to the database.');
        }
    }


    revalidatePath('/homepage-media');
    revalidatePath('/video-gallery');


    return { url: publicUrl, type };
}

export async function getHomepageMedia() {
    const { data, error } = await supabase
        .from('homepage_media')
        .select('id, value');

    if (error) {
        console.error("Error fetching homepage media:", error);
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
