
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Utensils, CalendarCheck, Newspaper, Video, Star } from "lucide-react";
import AdminChart from "./AdminChart";
import { RecentPayments } from "./RecentPayments";
import { useEffect, useState }from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getReservations } from "./actions";
import { useMenuStore } from "@/lib/menuStore";
import MenuManagement from "./MenuManagement";

const AdminDashboardPage = () => {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [reservationCount, setReservationCount] = useState(0);
    const { menuItems, isLoading: menuLoading, fetchMenuItems } = useMenuStore();

    useEffect(() => {
      setIsClient(true);
      
      const fetchInitialData = async () => {
        try {
            const reservations = await getReservations();
            setReservationCount(reservations.length);
        } catch (error) {
            console.error("Failed to fetch reservations:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not load reservation data."
            })
        }
      };
      
      fetchInitialData();
      // The menu store fetches automatically, so we don't need to call it here again
      // unless we want to force a refresh on component mount.
    }, [toast]);

    if (!isClient) {
      // Render a skeleton or null during server-side rendering
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
                        <TabsTrigger value="menu-management">Menu Management</TabsTrigger>
                        <TabsTrigger asChild><Link href="/reservations">Reservations</Link></TabsTrigger>
                        <TabsTrigger asChild><Link href="/manual-payments">Manual Payments</Link></TabsTrigger>
                        <TabsTrigger asChild><Link href="/menu">Public Menu</Link></TabsTrigger>
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
                                    <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
                                    <Utensils className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {menuLoading ? '...' : menuItems.length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        items available on the menu
                                    </p>
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
                                    <div className="text-2xl font-bold">+0</div>
                                    <p className="text-xs text-muted-foreground">posts on the blog page</p>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Homepage Videos</CardTitle>
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">+0</div>
                                    <p className="text-xs text-muted-foreground">
                                        videos featured on the homepage
                                    </p>
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
                     <TabsContent value="menu-management" className="space-y-4">
                        <MenuManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
