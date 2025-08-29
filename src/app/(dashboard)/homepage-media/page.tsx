import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

export default function HomepageMediaPage() {
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Hero Image</CardTitle>
            <CardDescription>Current image displayed on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-lg border">
              <Image
                src="https://picsum.photos/1200/800?random=10"
                alt="Current hero image"
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover"
                data-ai-hint="restaurant interior"
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="image-upload">Upload New Image</Label>
              <div className="flex gap-2">
                <Input id="image-upload" type="file" accept="image/*" />
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Hero Video</CardTitle>
            <CardDescription>Current video displayed on the homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-black">
                <video
                    src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
                    controls
                    className="aspect-video w-full"
                />
            </div>
             <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="video-upload">Upload New Video</Label>
              <div className="flex gap-2">
                <Input id="video-upload" type="file" accept="video/*" />
                <Button>
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
