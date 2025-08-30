
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Reservations", icon: BookCopy },
  { href: "/admin/manual-payments", label: "Manual Payments", icon: Landmark },
  { href: "/admin/blogs", label: "Blog", icon: Newspaper },
  { href: "/admin/menu", label: "Public Menu", icon: Utensils },
  { href: "/admin/homepage-media", label: "Homepage Media", icon: ImageIcon },
  { href: "/admin/video-gallery", label: "Video Gallery", icon: Video },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 p-2">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold font-headline text-primary-foreground group-data-[collapsible=icon]:hidden">
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
                isActive={pathname === link.href}
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
    </Sidebar>
  );
}
