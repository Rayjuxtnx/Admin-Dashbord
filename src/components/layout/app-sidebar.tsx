
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookCopy,
  LayoutGrid,
  ImageIcon,
  Landmark,
  LayoutDashboard,
  Utensils,
  Video,
  Settings,
  Newspaper,
  SendToBack,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/admin?tab=overview", label: "Overview", icon: LayoutDashboard, tab: "overview" },
  { href: "/admin?tab=reservations", label: "Reservations", icon: BookCopy, tab: "reservations" },
  { href: "/admin?tab=manual-payments", label: "Manual Payments", icon: Landmark, tab: "manual-payments" },
  { href: "/admin?tab=posts", label: "Posts", icon: Newspaper, tab: "posts" },
  { href: "/admin?tab=menu-management", label: "Menu Management", icon: Utensils, tab: "menu-management" },
  { href: "/admin?tab=homepage-media", label: "Homepage Media", icon: ImageIcon, tab: "homepage-media" },
  { href: "/admin?tab=video-gallery", label: "Video Gallery", icon: Video, tab: "video-gallery" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const isActive = (tab: string | undefined) => {
    return currentTab === tab && pathname === '/admin';
  }


  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 p-2">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            AdminLink
          </h1>
        </Link>
      </SidebarHeader>
      <Separator className="bg-sidebar-border" />
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(link.tab)}
                tooltip={link.label}
              >
                <Link href={link.href}>
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
        <p className="text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden text-center">
          Created by Philip Otieno Onyango
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
