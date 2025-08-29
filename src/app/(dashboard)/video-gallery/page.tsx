import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"

const galleryVideos = [
  { id: 1, src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", title: "Behind the Scenes" },
  { id: 2, src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", title: "Our Chef's Story" },
  { id: 3, src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", title: "A Taste of Summer" },
  { id: 4, src: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", title: "Cocktail Masterclass" },
]

export default function VideoGalleryPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Video Gallery
            </h1>
            <p className="text-muted-foreground">
                Upload and manage videos for your restaurant's gallery page.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Upload Video
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryVideos.map((video) => (
          <Card key={video.id} className="group relative overflow-hidden">
            <CardContent className="p-0">
              <video
                src={video.src}
                className="aspect-video w-full bg-black object-cover"
                preload="metadata"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="font-semibold text-white">{video.title}</h3>
              </div>
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="destructive" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
