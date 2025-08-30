
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { uploadMedia } from '@/app/admin/actions';

type MediaUploaderProps = {
    onUploadComplete?: (url: string, type: 'image' | 'video', purpose: 'homepage_hero' | 'gallery') => void;
    purpose?: 'homepage_hero' | 'gallery';
}

const MediaUploader = ({ onUploadComplete, purpose = 'gallery' }: MediaUploaderProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
        };
        reader.readAsDataURL(selectedFile);
        
        setFile(selectedFile);
        setFileType(selectedFile.type.startsWith('video') ? 'video' : 'image');
    };

    const handleUpload = async () => {
        if (!file || !fileType) {
            toast({
                variant: "destructive",
                title: "No file selected",
                description: "Please choose a file to upload.",
            });
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        try {
            const newMedia = await uploadMedia(formData);
            
            toast({
                title: "Upload Successful!",
                description: `${file.name} has been uploaded and saved.`,
            });
            
            if (onUploadComplete) {
                onUploadComplete(newMedia.url, newMedia.type, purpose);
            }

            // Reset state
            setFile(null);
            setPreview(null);
            setFileType(null);

        } catch (error) {
            console.error("Upload failed:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not upload the file. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Media Uploader</CardTitle>
                <CardDescription>
                    {purpose === 'gallery' 
                        ? "Upload images or videos for the public Gallery page." 
                        : "Upload a new hero image or video for the homepage."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="media-upload">Select File</Label>
                    <Input id="media-upload" type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={isLoading}/>
                 </div>
                {preview && fileType === 'image' && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Image Preview</p>
                        <Image src={preview} alt="Image preview" width={200} height={200} className="rounded-md object-cover" />
                    </div>
                )}
                {preview && fileType === 'video' && (
                    <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Video Preview</p>
                        <video src={preview} controls className="w-full rounded-md" />
                    </div>
                )}
                <Button onClick={handleUpload} className="w-full" disabled={!file || isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Media
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

export default MediaUploader;
