import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UtensilsCrossed, Clock, MapPin, Smile, ArrowRight } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { unstable_noStore as noStore } from 'next/cache';

const defaultHeroMedia = {
  type: 'image',
  url: "https://picsum.photos/1200/800",
  aiHint: 'restaurant food',
};


const signatureDishes = [
  {
    name: "Pilau Wednesday Special",
    description: "Aromatic spiced rice with tender beef, a true taste of the coast.",
    image: "https://picsum.photos/600/400",
    aiHint: "kenyan food pilau"
  },
  {
    name: "Chef's Grilled Tilapia",
    description: "Fresh tilapia marinated and grilled to perfection, served with ugali.",
    image: "https://picsum.photos/600/400",
    aiHint: "grilled fish"
  },
  {
    name: "Family Feast Platter",
    description: "A generous platter of nyama choma, sausages, and sides for the whole family.",
    image: "https://picsum.photos/600/400",
    aiHint: "barbecue platter"
  },
];

const sellingPoints = [
    {
        icon: MapPin,
        title: "Mall Advantage",
        description: "Conveniently located inside Gateway Mall. Perfect for a meal after shopping."
    },
    {
        icon: UtensilsCrossed,
        title: "Local & Modern Cuisine",
        description: "From traditional Kenyan meals to fast casual bites, we have it all."
    },
    {
        icon: Smile,
        title: "Great for Everyone",
        description: "An accessible and central spot for families, friends, and office workers."
    },
    {
        icon: Clock,
        title: "Affordable & Tasty",
        description: "Enjoy delicious 'home away from home' meals without breaking the bank."
    }
]

export default async function Home() {
  noStore();
  const supabase = await createServiceRoleClient();

  const { data: heroMediaData, error } = await supabase
    .from('gallery')
    .select('url, type, alt_text')
    .eq('purpose', 'homepage_hero')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn("Could not fetch hero media from Supabase, using default. Error:", error.message);
  }

  const heroMedia = heroMediaData ? {
    url: heroMediaData.url,
    type: heroMediaData.type as 'image' | 'video',
    aiHint: heroMediaData.alt_text || 'homepage hero'
  } : defaultHeroMedia;

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-white">
        {heroMedia.type === 'image' ? (
            <Image
            src={heroMedia.url}
            alt="Hero background image"
            fill
            className="absolute z-0 object-cover"
            data-ai-hint={heroMedia.aiHint}
            priority
            unoptimized
            />
        ) : (
            <video
                src={heroMedia.url}
                autoPlay
                loop
                muted
                playsInline
                className="absolute z-0 w-full h-full object-cover"
            />
        )}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 text-center p-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold !text-white drop-shadow-2xl">
            Delicious Meals, Right Inside The Mall
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto !text-white/90 drop-shadow-xl">
            Experience the perfect blend of traditional Kenyan flavors and modern cuisine. Your convenient and tasty escape.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="default">
              <Link href="/menu">View Menu</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="signature-dishes" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Signature Dishes</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated by our chefs, loved by our customers. Get a taste of what makes us special.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {signatureDishes.map((dish, i) => (
              <Card 
                key={dish.name} 
                className="overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg hover:shadow-2xl animate-fade-in-up"
              >
                <CardHeader className="p-0">
                  <div className="relative h-60 w-full">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={dish.aiHint}
                      unoptimized
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="font-headline text-2xl">{dish.name}</CardTitle>
                  <CardDescription className="mt-2">{dish.description}</CardDescription>
                  <Button asChild variant="link" className="p-0 mt-4 text-primary">
                    <Link href="/menu">Explore Menu <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="why-us" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Your Perfect Spot in the Mall</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
              We've created a space that's convenient, welcoming, and serves up delight with every dish.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellingPoints.map((point) => (
                <div key={point.title} className="text-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mx-auto mb-4">
                        <point.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-headline text-xl font-semibold">{point.title}</h3>
                    <p className="mt-1 text-muted-foreground">{point.description}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}