'use client'

import { useState } from "react";
import { 
  LayoutDashboard, 
  ClipboardList,
  GitBranch,
  Users, 
  Wrench, 
  CalendarRange,
  FileText,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserCircle,
  Shield,
  Layers,
  Crown,
  LucideIcon
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

type MenuChild = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  children?: MenuChild[];
};

const menuItems: MenuItem[] = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: LayoutDashboard 
  },
  { 
    title: "Gestion des Tâches", 
    url: "/taches", 
    icon: ClipboardList 
  },
  { 
    title: "Gestion des Phases", 
    url: "/phases", 
    icon: GitBranch 
  },
  // Bloc spécial pour la gestion des employés avec sous-menu
  {
    title: "Gestion des Employés",
    url: "/employes",
    icon: Users,
    children: [
      { title: "Employé", url: "/employes", icon: UserCircle },
      { title: "Brigade", url: "/brigades", icon: Shield },
      { title: "Équipe", url: "/equipes", icon: Layers },
      { title: "Chef de brigade", url: "/chefs-brigade", icon: Crown },
    ],
  },
  { 
    title: "Gestion des Matériels", 
    url: "/materiels", 
    icon: Wrench 
  },
  { 
    title: "Gestion des Absences", 
    url: "/absences", 
    icon: CalendarRange 
  },
  { 
    title: "Gestion des Rapports", 
    url: "/rapports", 
    icon: FileText 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [openEmployees, setOpenEmployees] = useState<boolean>(true);

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
              {menuItems.map((item) => {
                if ("children" in item) {
                  const isParentActive =
                    currentPath.startsWith("/employes") ||
                    currentPath.startsWith("/brigades") ||
                    currentPath.startsWith("/equipes") ||
                    currentPath.startsWith("/chefs-brigade");

                  const handleToggle = () => setOpenEmployees((prev) => !prev);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <div
                        className={`flex items-center rounded-md ${isParentActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <Link
                          href={item.url}
                          className="flex flex-1 items-center gap-2 px-3 py-2 text-sm transition-smooth"
                          onClick={() => setOpenEmployees(true)}
                        >
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleToggle();
                          }}
                          aria-label={
                            openEmployees
                              ? "Réduire la gestion des employés"
                              : "Déployer la gestion des employés"
                          }
                          aria-expanded={openEmployees}
                          className="p-2 transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary"
                        >
                          {openEmployees ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Sous-menu */}
                      {!collapsed && openEmployees && (
                        <div className="mt-1 ml-7 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.title}
                              href={child.url}
                              className={`block rounded-md px-3 py-1.5 text-sm transition-smooth ${
                                isActive(child.url)
                                  ? "bg-sidebar-primary/90 text-sidebar-primary-foreground font-medium"
                                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <child.icon className="h-3.5 w-3.5" />
                                <span>{child.title}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="transition-smooth">
                      <Link href={item.url} className={getNavClass(item.url)}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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