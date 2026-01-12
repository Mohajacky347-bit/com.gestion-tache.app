'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Shield, ClipboardList, FileText, Wrench, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    url: "/brigade",
    icon: Home,
  },
  {
    title: "Mes Tâches",
    url: "/brigade/taches",
    icon: ClipboardList,
  },
  {
    title: "Rapports",
    url: "/brigade/rapports",
    icon: FileText,
  },
  {
    title: "Matériels",
    url: "/brigade/materiels",
    icon: Wrench,
  },
];

export function BrigadeSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Brigade</span>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className="w-full"
                  >
                    <Link 
                      href={item.url} 
                      prefetch={true}
                      className="transition-all duration-150"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

