
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { getGalleryMedia, deleteGalleryMedia } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { GalleryMedia } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import MediaUploader from "../MediaUploader";

export default function ImageGalleryPage() {
  const [images, setImages] = useState<GalleryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchImages = async () => {
    setIsLoading(true);
    const allMedia = await getGalleryMedia();
    setImages(allMedia.filter((m) => m.type === 'image' && m.purpose === 'gallery'));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: number, path: string) => {
    try {
      await deleteGalleryMedia(id, path);
      toast({
        title: "Image Deleted",
        description: "The image has been removed from the gallery.",
      });
      fetchImages(); // Refresh the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the image. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
              Image Gallery
          </h1>
          <p className="text-muted-foreground">
              Upload and manage images for your restaurant's gallery page.
          </p>
      </header>

      <div>
        <MediaUploader 
            onUploadComplete={fetchImages}
            purpose="gallery"
            accept="image/*"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
            ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <p className="text-muted-foreground">No images have been uploaded to the gallery yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <Card key={image.id} className="group relative overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={image.url}
                  alt={image.alt_text || 'Gallery Image'}
                  width={400}
                  height={400}
                  className="aspect-square w-full object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-semibold text-white truncate" title={image.alt_text || ''}>{image.alt_text}</h3>
                </div>
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDelete(image.id, image.path)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete image</span>
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
