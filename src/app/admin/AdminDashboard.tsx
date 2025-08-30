
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { Utensils, CalendarCheck, Newspaper, Video, Landmark } from "lucide-react";
import AdminChart, { ProcessedSalesData } from "./AdminChart";
import { RecentPayments } from "./RecentPayments";
import { useEffect, useState, useCallback }from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getDashboardCounts, getSalesDataForChart } from "./actions";
import { useMenuStore } from "@/lib/menuStore";
import MenuManagement from "./MenuManagement";
import { Skeleton } from "@/components/ui/skeleton";
import ReservationsList from "../(dashboard)/reservations/page";
import ManualConfirmationsList from "./ManualConfirmationsList";
import PostManagementPage from "./posts/page";
import HomepageMediaPage from "./homepage-media/page";
import VideoGalleryPage from "./video-gallery/page";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";


const AdminDashboard = () => {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [counts, setCounts] = useState({
      reservationsCount: 0,
      totalRevenue: 'Ksh 0',
      publishedPostsCount: 0,
      videosCount: 0,
      pendingManualPayments: 0,
    });
    const [chartData, setChartData] = useState<ProcessedSalesData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { menuItems, isLoading: menuLoading, fetchMenuItems } = useMenuStore();
    
    useEffect(() => {
        const currentTab = searchParams.get('tab') || 'overview';
        setActiveTab(currentTab);
    }, [searchParams]);
    
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        router.push(`${pathname}?${params.toString()}`);
    };

    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [countsData, salesData] = await Promise.all([
              getDashboardCounts(),
              getSalesDataForChart()
            ]);
            setCounts(countsData);
            setChartData(salesData);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not load dashboard data."
            })
        } finally {
          setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
      fetchDashboardData();
      fetchMenuItems();
      
      const channel = supabase
        .channel('realtime-dashboard-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            console.log('Database change detected, refreshing dashboard data...', payload.table);
            fetchDashboardData();
            if (payload.table === 'menu_items') {
                fetchMenuItems();
            }
          }
        )
        .subscribe();
        
      return () => {
          supabase.removeChannel(channel);
      }

    }, [toast, fetchMenuItems, fetchDashboardData]);

    const StatCard = ({ title, value, icon: Icon, description, isLoading: cardIsLoading }: { title: string, value: string | number, icon: React.ElementType, description: string, isLoading: boolean}) => (
       <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              {cardIsLoading ? (
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

    const TabWithBadge = ({ value, label, count, isLoading: badgeIsLoading }: { value: string, label: string, count: number, isLoading: boolean}) => (
        <TabsTrigger value={value} className="flex items-center gap-2">
            {label}
            {badgeIsLoading ? <Skeleton className="h-5 w-5 rounded-full" /> : count > 0 && <Badge variant="secondary">{count}</Badge>}
        </TabsTrigger>
    );

    return (
        <DashboardLayout>
            <div className="flex-col md:flex">
                <div className="flex-1 space-y-4">
                    <div className="px-4 md:px-6 lg:px-8 flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    </div>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                        <div className="w-full overflow-x-auto px-4 md:px-6 lg:px-8">
                             <TabsList className="md:w-auto">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabWithBadge value="menu-management" label="Menu Management" count={menuItems.length} isLoading={menuLoading} />
                                <TabWithBadge value="reservations" label="Reservations" count={counts.reservationsCount} isLoading={isLoading} />
                                <TabWithBadge value="manual-payments" label="Manual Payments" count={counts.pendingManualPayments} isLoading={isLoading} />
                                <TabWithBadge value="posts" label="Posts" count={counts.publishedPostsCount} isLoading={isLoading} />
                                <TabsTrigger value="homepage-media">Homepage Media</TabsTrigger>
                                <TabWithBadge value="video-gallery" label="Video Gallery" count={counts.videosCount} isLoading={isLoading} />
                            </TabsList>
                        </div>
                        <div className="px-4 md:px-6 lg:px-8">
                            <TabsContent value="overview" className="space-y-4 mt-0">
                                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                                    <StatCard 
                                        title="Total Revenue"
                                        value={counts.totalRevenue}
                                        icon={Landmark}
                                        description="from all successful payments"
                                        isLoading={isLoading}
                                    />
                                    <StatCard 
                                        title="Total Reservations"
                                        value={counts.reservationsCount}
                                        icon={CalendarCheck}
                                        description="active bookings"
                                        isLoading={isLoading}
                                    />
                                    <StatCard 
                                        title="Total Menu Items"
                                        value={menuItems.length}
                                        icon={Utensils}
                                        description="items available on the menu"
                                        isLoading={menuLoading}
                                    />
                                    <StatCard 
                                        title="Published Posts"
                                        value={counts.publishedPostsCount}
                                        icon={Newspaper}
                                        description="posts on the blog page"
                                        isLoading={isLoading}
                                    />
                                </div>
                                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                                    <Card className="lg:col-span-4 col-span-full">
                                        <CardHeader>
                                            <CardTitle>Sales Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pl-2">
                                            <AdminChart data={chartData} isLoading={isLoading}/>
                                        </CardContent>
                                    </Card>
                                    <Card className="lg:col-span-3 col-span-full">
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
                            <TabsContent value="menu-management" className="space-y-4 mt-0">
                                <MenuManagement />
                            </TabsContent>
                             <TabsContent value="reservations" className="space-y-4 mt-0">
                                <ReservationsList />
                            </TabsContent>
                            <TabsContent value="manual-payments" className="space-y-4 mt-0">
                                <ManualConfirmationsList />
                            </TabsContent>
                            <TabsContent value="posts" className="space-y-4 mt-0">
                                <PostManagementPage />
                            </TabsContent>
                            <TabsContent value="homepage-media" className="space-y-4 mt-0">
                                <HomepageMediaPage />
                            </TabsContent>
                            <TabsContent value="video-gallery" className="space-y-4 mt-0">
                                <VideoGalleryPage />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AdminDashboard;
