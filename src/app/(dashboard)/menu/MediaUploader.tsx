
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from 'lucide-react';

interface MediaUploaderProps {
  onImageUpload: (newImageUrl: string) => void;
}

const MediaUploader = ({ onImageUpload }: MediaUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      // In a real app, you would upload the file to a service like
      // Firebase Storage or Supabase Storage and get back a URL.
      // For this placeholder, we'll just simulate it with a random image.
      const randomId = Math.floor(Math.random() * 1000);
      const newImageUrl = `https://picsum.photos/seed/${randomId}/600/400`;
      onImageUpload(newImageUrl);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
        <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="image-upload">Upload New Image or Video</Label>
            <div className="flex gap-2">
            <Input id="image-upload" type="file" onChange={handleFileChange} />
            <Button onClick={handleUpload} disabled={!file}>
                <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
            </div>
        </div>
        {file && (
            <p className="text-sm text-muted-foreground">
                Selected file: {file.name}
            </p>
        )}
    </div>
  );
};

export default MediaUploader;
