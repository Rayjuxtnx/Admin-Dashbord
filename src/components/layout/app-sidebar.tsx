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
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/reservations", label: "Reservations", icon: BookCopy },
  { href: "/manual-payments", label: "Manual Payments", icon: Landmark },
  { href: "/menu", label: "Menu", icon: Utensils },
  { href: "/homepage-media", label: "Homepage Media", icon: ImageIcon },
  { href: "/video-gallery", label: "Video Gallery", icon: Video },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 p-2" passHref>
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
              <Link href={link.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === link.href || (link.href === '/' && pathname === '/')}
                  tooltip={link.label}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
