
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHomepageMedia } from "../actions";
import MediaUploader from "./MediaUploader";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomepageMediaPage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async () => {
    setIsLoading(true);
    const { heroImageUrl, heroVideoUrl } = await getHomepageMedia();
    setHeroImageUrl(heroImageUrl);
    setHeroVideoUrl(heroVideoUrl);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadComplete = (url: string, type: 'image' | 'video') => {
    // Refetch the media to display the newly uploaded content
    fetchMedia();
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Homepage Media
        </h1>
        <p className="text-muted-foreground">
          Change the main hero image or video on your homepage.
        </p>
      </header>

      <div>
        <MediaUploader onUploadComplete={handleUploadComplete} purpose="homepage_hero" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Current Hero Image</CardTitle>
            <CardDescription>This is the image currently displayed on the homepage.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="aspect-[3/2] w-full" />
            ) : (
              heroImageUrl && (
                <div className="overflow-hidden rounded-lg border">
                  <Image
                    src={heroImageUrl}
                    alt="Current hero image"
                    width={1200}
                    height={800}
                    className="aspect-[3/2] w-full object-cover"
                    unoptimized // Add this if you are using Supabase storage URLs that don't support Next.js image optimization
                    key={heroImageUrl} // Add key to force re-render
                  />
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Current Hero Video</CardTitle>
            <CardDescription>This is the video currently displayed on the homepage.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <Skeleton className="aspect-video w-full" />
            ) : (
                heroVideoUrl && (
                    <div className="overflow-hidden rounded-lg border bg-black">
                        <video
                            src={heroVideoUrl}
                            controls
                            className="aspect-video w-full"
                            key={heroVideoUrl} // Add key to force re-render
                        />
                    </div>
                )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
