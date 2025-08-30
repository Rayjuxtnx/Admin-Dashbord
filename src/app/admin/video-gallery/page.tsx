
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { getGalleryMedia, deleteGalleryMedia } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { GalleryMedia } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import MediaUploader from "../MediaUploader";

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState<GalleryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchVideos = async () => {
    setIsLoading(true);
    const allMedia = await getGalleryMedia();
    setVideos(allMedia.filter((m) => m.type === 'video' && m.purpose === 'gallery'));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: number, path: string) => {
    try {
      await deleteGalleryMedia(id, path);
      toast({
        title: "Video Deleted",
        description: "The video has been removed from the gallery.",
      });
      fetchVideos(); // Refresh the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the video. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
              Video Gallery
          </h1>
          <p className="text-muted-foreground">
              Upload and manage videos for your restaurant's gallery page.
          </p>
      </header>

      <div>
        <MediaUploader 
            onUploadComplete={fetchVideos}
            purpose="gallery"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-video w-full" />
            ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <p className="text-muted-foreground">No videos have been uploaded to the gallery yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="group relative overflow-hidden">
              <CardContent className="p-0">
                <video
                  src={video.url}
                  className="aspect-video w-full bg-black object-cover"
                  controls
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-semibold text-white">{video.alt_text}</h3>
                </div>
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDelete(video.id, video.path)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete video</span>
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
