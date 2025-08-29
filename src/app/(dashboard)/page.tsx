"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Utensils, CalendarCheck, Newspaper, Video, Star } from "lucide-react";
import AdminChart from "./AdminChart";
import { RecentPayments } from "./RecentPayments";
import { useMenuStore } from "@/lib/menuStore";
import { useEffect, useState }from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import ReservationsList from "./ReservationsList";
import { getReservations } from "./actions";
import ManualConfirmationsList from "./ManualConfirmationsList";
import MediaUploader from "./MediaUploader";

const blogPosts = [
  {
    slug: "/blog/secret-nyama-choma"
  },
  {
    slug: "/blog/pilau-vs-biryani"
  },
  {
    slug: "/blog/mall-advantage"
  }
];

const signatureDishes = [
  {
    name: "Pilau Wednesday Special",
    description: "Aromatic spiced rice with tender beef, a true taste of the coast.",
    image: "https://images.unsplash.com/photo-1647998270792-69ac80570183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8a2VueWFuJTIwZm9vZCUyMHBpbGF1fGVufDB8fHx8MTc1NTc4NDI3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    aiHint: "kenyan food pilau"
  },
  {
    name: "Chef's Grilled Tilapia",
    description: "Fresh tilapia marinated and grilled to perfection, served with ugali.",
    image: "https://images.unsplash.com/photo-1656945764473-6157c129817e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxncmlsbGVkJTIwZmlzaHxlbnwwfHx8fDE3NTU3ODQyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    aiHint: "grilled fish"
  },
  {
    name: "Family Feast Platter",
    description: "A generous platter of nyama choma, sausages, and sides for the whole family.",
    image: "https://images.unsplash.com/photo-1708388464667-c1b1c97fbae3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxiYXJiZWN1ZSUyMHBsYXR0ZXJ8ZW58MHx8fHwxNzU1Nzg0MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    aiHint: "barbecue platter"
  },
];


const AdminDashboardPage = () => {
    const { menuItems, fetchMenuItems } = useMenuStore();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [reservationCount, setReservationCount] = useState(0);

    useEffect(() => {
      setIsClient(true);
      
      const fetchInitialData = async () => {
        try {
            await fetchMenuItems();
            const reservations = await getReservations();
            setReservationCount(reservations.length);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not load dashboard data."
            })
        }
      }
      
      fetchInitialData();
    }, [fetchMenuItems, toast]);

    const handleUploadComplete = (url: string, type: 'image' | 'video', purpose: 'homepage_hero' | 'gallery') => {
        let title = '';
        if(purpose === 'homepage_hero') title = `Homepage ${type} Updated!`;
        if(purpose === 'gallery') title = `Gallery ${type} Updated!`;

        toast({
            title: title,
            description: `The new ${type} is now live.`,
        });
    }

    if (!isClient) {
      return null;
    }

    return (
        <div className="flex-col md:flex">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                </div>
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger asChild><Link href="/reservations">Reservations</Link></TabsTrigger>
                        <TabsTrigger asChild><Link href="/manual-payments">Manual Payments</Link></TabsTrigger>
                        <TabsTrigger asChild><Link href="/admin/menu">Menu Management</Link></TabsTrigger>
                        <TabsTrigger asChild><Link href="/gallery">Photo Gallery</Link></TabsTrigger>
                        <TabsTrigger asChild><Link href="/homepage-media">Homepage Media</Link></TabsTrigger>
                        <TabsTrigger asChild>
                           <Link href="/video-gallery">Video Gallery</Link>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Homepage Signature Dishes</CardTitle>
                                    <Star className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{signatureDishes.length}</div>
                                    <p className="text-xs text-muted-foreground">dishes featured on the homepage</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
                                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reservationCount}</div>
                                    <p className="text-xs text-muted-foreground">active bookings</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Published Blogs</CardTitle>
                                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+{blogPosts.length}</div>
                                    <p className="text-xs text-muted-foreground">posts on the blog page</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Videos Uploaded</CardTitle>
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">0</div>
                                    <p className="text-xs text-muted-foreground">No videos uploaded yet</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Sales Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <AdminChart />
                                </CardContent>
                            </Card>
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Recent Payments (STK)</CardTitle>
                                    <CardDescription>Latest automated M-Pesa STK Push transactions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RecentPayments />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
