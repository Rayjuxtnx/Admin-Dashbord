'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Utensils, CalendarCheck, Newspaper, Video, ListOrdered } from "lucide-react";
import AdminChart from "./AdminChart";
import { RecentPayments } from "./RecentPayments";
import MediaUploader from "./MediaUploader";
import MenuManagement from "./MenuManagement";
import { useMenuStore } from "@/lib/menuStore";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import ReservationsList from "./ReservationsList";
import { getReservations } from "./actions";
import ManualConfirmationsList from "./ManualConfirmationsList";

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

const AdminDashboardPage = () => {
    const { menuItems } = useMenuStore();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [reservationCount, setReservationCount] = useState(0);

    const allMenuItems = useMemo(() => {
        return menuItems || [];
    }, [menuItems]);


    useEffect(() => {
      setIsClient(true);
      const fetchReservationCount = async () => {
        try {
            const reservations = await getReservations();
            setReservationCount(reservations.length);
        } catch (error) {
            console.error("Failed to fetch reservations:", error);
            setReservationCount(0);
        }
      }
      fetchReservationCount();
    }, []);

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
                        <TabsTrigger value="reservations">Reservations</TabsTrigger>
                        <TabsTrigger value="manual_payments">Manual Payments</TabsTrigger>
                        <TabsTrigger value="menu">Menu Management</TabsTrigger>
                        <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
                        <TabsTrigger value="uploads">Homepage Media</TabsTrigger>
                        <TabsTrigger asChild>
                           <Link href="/video-gallery">Video Gallery</Link>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
                                    <Utensils className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{allMenuItems.length}</div>
                                    <p className="text-xs text-muted-foreground">items available on the menu</p>
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
                     <TabsContent value="reservations" className="space-y-4">
                        <ReservationsList />
                    </TabsContent>
                    <TabsContent value="manual_payments" className="space-y-4">
                        <ManualConfirmationsList />
                    </TabsContent>
                    <TabsContent value="menu" className="space-y-4">
                        <MenuManagement />
                    </TabsContent>
                    <TabsContent value="gallery" className="space-y-4">
                        <MediaUploader onUploadComplete={(url, type) => handleUploadComplete(url, type, 'gallery')} purpose="gallery" />
                    </TabsContent>
                    <TabsContent value="uploads" className="space-y-4">
                        <MediaUploader onUploadComplete={(url, type) => handleUploadComplete(url, type, 'homepage_hero')} purpose="homepage_hero" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
