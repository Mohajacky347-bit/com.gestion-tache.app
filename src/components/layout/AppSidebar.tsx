'use client'

import { useState } from "react";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Wrench, 
  Calendar,
  Bell,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: LayoutDashboard 
  },
  { 
    title: "Gestion des Tâches", 
    url: "/taches", 
    icon: CheckSquare 
  },
  { 
    title: "Gestion des Phases", 
    url: "/phases", 
    icon: CheckSquare 
  },
  { 
    title: "Gestion des Employés", 
    url: "/employes", 
    icon: Users 
  },
  { 
    title: "Gestion des Matériels", 
    url: "/materiels", 
    icon: Wrench 
  },
  { 
    title: "Gestion des Absences", 
    url: "/absences", 
    icon: Calendar 
  },
  { 
    title: "Gestion des Absences", 
    url: "/rapports", 
    icon: Calendar 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <LayoutDashboard className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">Infrastructure</h2>
              <p className="text-xs text-sidebar-foreground/70">Gare Fianarantsoa</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="transition-smooth">
                    <Link href={item.url} className={getNavClass(item.url)}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4 space-y-3">
            <div className="rounded-lg bg-sidebar-accent p-3">
              <div className="flex items-center gap-2 text-sidebar-accent-foreground">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              <p className="text-xs text-sidebar-accent-foreground/70 mt-1">
                3 nouvelles tâches assignées
              </p>
            </div>
            
            <SidebarMenuButton 
              onClick={handleLogout}
              className="w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-smooth"
            >
              <LogOut className="h-5 w-5" />
              <span>Se déconnecter</span>
            </SidebarMenuButton>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}