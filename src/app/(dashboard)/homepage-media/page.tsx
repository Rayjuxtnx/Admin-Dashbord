
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGalleryMedia } from "../actions";
import MediaUploader from "./MediaUploader";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryMedia } from "@/lib/types";

export default function HomepageMediaPage() {
  const [heroImage, setHeroImage] = useState<GalleryMedia | null>(null);
  const [heroVideo, setHeroVideo] = useState<GalleryMedia | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async () => {
    setIsLoading(true);
    const allMedia: GalleryMedia[] = await getGalleryMedia();
    
    // Find the most recent image and video for the hero
    const heroImage = allMedia
      .filter(m => m.purpose === 'homepage_hero' && m.type === 'image')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
      
    const heroVideo = allMedia
      .filter(m => m.purpose === 'homepage_hero' && m.type === 'video')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

    setHeroImage(heroImage);
    setHeroVideo(heroVideo);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Homepage Media
        </h1>
        <p className="text-muted-foreground">
          Upload a new hero image or video. The most recently uploaded one will be used.
        </p>
      </header>

      <div>
        <MediaUploader onUploadComplete={fetchMedia} purpose="homepage_hero" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Current Hero Image</CardTitle>
            <CardDescription>This is the most recent hero image uploaded.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="aspect-[3/2] w-full" />
            ) : heroImage ? (
                <div className="overflow-hidden rounded-lg border">
                  <Image
                    src={heroImage.url}
                    alt={heroImage.alt_text || 'Current hero image'}
                    width={1200}
                    height={800}
                    className="aspect-[3/2] w-full object-cover"
                    unoptimized 
                    key={heroImage.id}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-10">No hero image has been uploaded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Current Hero Video</CardTitle>
            <CardDescription>This is the most recent hero video uploaded.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <Skeleton className="aspect-video w-full" />
            ) : heroVideo ? (
                <div className="overflow-hidden rounded-lg border bg-black">
                    <video
                        src={heroVideo.url}
                        controls
                        className="aspect-video w-full"
                        key={heroVideo.id}
                    />
                </div>
              ) : (
                 <p className="text-muted-foreground text-center py-10">No hero video has been uploaded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

