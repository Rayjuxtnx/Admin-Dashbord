
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Utensils, CalendarCheck, Newspaper, Video, Landmark } from "lucide-react";
import AdminChart from "./AdminChart";
import { RecentPayments } from "./RecentPayments";
import { useEffect, useState }from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getDashboardCounts } from "./actions";
import { useMenuStore } from "@/lib/menuStore";
import MenuManagement from "./MenuManagement";
import { Skeleton } from "@/components/ui/skeleton";
import ReservationsList from "./ReservationsList";
import ManualConfirmationsList from "./ManualConfirmationsList";
import BlogManagementPage from "./blogs/page";
import HomepageMediaPage from "./homepage-media/page";
import VideoGalleryPage from "./video-gallery/page";
import { DashboardLayout } from "@/components/layout/dashboard-layout";


const AdminDashboardPage = () => {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [counts, setCounts] = useState({
      reservationsCount: 0,
      totalRevenue: 'Ksh 0',
      publishedBlogsCount: 0,
      videosCount: 0,
    });
    const [isLoadingCounts, setIsLoadingCounts] = useState(true);
    const { menuItems, isLoading: menuLoading, fetchMenuItems } = useMenuStore();

    useEffect(() => {
      setIsClient(true);
      
      const fetchInitialData = async () => {
        setIsLoadingCounts(true);
        try {
            const { reservationsCount, totalRevenue, publishedBlogsCount, videosCount } = await getDashboardCounts();
            setCounts({
              reservationsCount,
              totalRevenue,
              publishedBlogsCount,
              videosCount
            })
        } catch (error) {
            console.error("Failed to fetch dashboard counts:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not load dashboard data."
            })
        } finally {
          setIsLoadingCounts(false);
        }
      };
      
      fetchInitialData();
      fetchMenuItems();
    }, [toast, fetchMenuItems]);

    if (!isClient) {
      return null;
    }

    const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string, value: string | number, icon: React.ElementType, description: string, isLoading: boolean}) => (
       <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
              ) : (
                <div className="text-2xl font-bold">{value}</div>
              )}
              <p className="text-xs text-muted-foreground">
                  {description}
              </p>
          </CardContent>
      </Card>
    )

    return (
        <DashboardLayout>
            <div className="flex-col md:flex">
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    </div>
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="menu-management">Menu Management</TabsTrigger>
                            <TabsTrigger value="reservations">Reservations</TabsTrigger>
                            <TabsTrigger value="manual-payments">Manual Payments</TabsTrigger>
                            <TabsTrigger value="blog">Blog</TabsTrigger>
                            <TabsTrigger value="homepage-media">Homepage Media</TabsTrigger>
                            <TabsTrigger value="video-gallery">Video Gallery</TabsTrigger>
                            <TabsTrigger asChild><Link href="/menu">Public Menu</Link></TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <StatCard 
                                    title="Total Revenue"
                                    value={counts.totalRevenue}
                                    icon={Landmark}
                                    description="from all successful payments"
                                    isLoading={isLoadingCounts}
                                />
                                <StatCard 
                                    title="Total Reservations"
                                    value={counts.reservationsCount}
                                    icon={CalendarCheck}
                                    description="active bookings"
                                    isLoading={isLoadingCounts}
                                />
                                <StatCard 
                                    title="Total Menu Items"
                                    value={menuItems.length}
                                    icon={Utensils}
                                    description="items available on the menu"
                                    isLoading={menuLoading}
                                />
                                <StatCard 
                                    title="Published Blogs"
                                    value={`+${counts.publishedBlogsCount}`}
                                    icon={Newspaper}
                                    description="posts on the blog page"
                                    isLoading={isLoadingCounts}
                                />
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
                         <TabsContent value="reservations" className="space-y-4">
                            <ReservationsList />
                        </TabsContent>
                        <TabsContent value="manual-payments" className="space-y-4">
                            <ManualConfirmationsList />
                        </TabsContent>
                        <TabsContent value="blog" className="space-y-4">
                            <BlogManagementPage />
                        </TabsContent>
                        <TabsContent value="homepage-media" className="space-y-4">
                            <HomepageMediaPage />
                        </TabsContent>
                        <TabsContent value="video-gallery" className="space-y-4">
                            <VideoGalleryPage />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminDashboardPage;
