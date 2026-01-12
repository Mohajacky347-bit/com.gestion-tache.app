'use client'

import { useState, useEffect } from "react";
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
  LucideIcon,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const isParentActive =
    currentPath.startsWith("/employes") ||
    currentPath.startsWith("/brigades") ||
    currentPath.startsWith("/equipes") ||
    currentPath.startsWith("/chefs-brigade");

  return (
    <Sidebar className="border-r border-slate-200/60 bg-white">
      <SidebarHeader className="relative p-4 border-b border-slate-100">
        <div className={`flex items-center gap-3 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Image 
              src="/fce.jpeg" 
              alt="FCE" 
              width={24} 
              height={24}
            />
          </div>
          
          {!collapsed && (
            <div className="flex-1">
              <h2 className="text-base font-semibold text-slate-800">
                Infrastructure
              </h2>
              <p className="text-xs text-slate-500">Gare Fianarantsoa</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="relative">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-0.5">
              {menuItems.map((item, index) => {
                const isItemActive = isActive(item.url);
                
                if ("children" in item) {
                  const handleToggle = () => setOpenEmployees((prev) => !prev);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <div className="relative group">
                        {isParentActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-600 rounded-r" />
                        )}
                        
                        <div className={`flex items-center rounded-lg transition-colors ${
                          isParentActive
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}>
                          <Link
                            href={item.url}
                            prefetch={true}
                            className="flex flex-1 items-center gap-3 px-3 py-2.5 text-sm"
                            onClick={() => setOpenEmployees(true)}
                          >
                            <item.icon className={`h-5 w-5 ${
                              isParentActive ? "text-blue-600" : "text-slate-500"
                            }`} />
                            {!collapsed && (
                              <span className={`font-medium ${
                                isParentActive 
                                  ? "text-blue-900" 
                                  : "text-slate-700"
                              }`}>
                                {item.title}
                              </span>
                            )}
                          </Link>
                          {!collapsed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleToggle();
                              }}
                              className={`p-2 mr-1 rounded transition-colors ${
                                isParentActive ? "text-blue-600 hover:bg-blue-100" : "text-slate-400 hover:bg-slate-100"
                              }`}
                            >
                              {openEmployees ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {!collapsed && (
                          <div className={`overflow-hidden transition-all duration-200 ${
                            openEmployees ? "max-h-96 opacity-100 mt-0.5" : "max-h-0 opacity-0"
                          }`}>
                            <div className="ml-6 space-y-0.5 pl-4 border-l border-slate-200">
                              {item.children.map((child) => {
                                const isChildActive = isActive(child.url);
                                return (
                                  <Link
                                    key={child.title}
                                    href={child.url}
                                    prefetch={true}
                                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-150 ${
                                      isChildActive
                                        ? "bg-blue-50 text-blue-900 font-medium"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                  >
                                    <child.icon className={`h-4 w-4 ${
                                      isChildActive ? "text-blue-600" : "text-slate-400"
                                    }`} />
                                    <span>{child.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <div className="relative group">
                      {isItemActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-blue-600 rounded-r" />
                      )}
                      
                      <SidebarMenuButton asChild>
                        <Link 
                          href={item.url}
                          prefetch={true}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                            isItemActive
                              ? "bg-blue-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${
                            isItemActive ? "text-blue-600" : "text-slate-500"
                          }`} />
                          {!collapsed && (
                            <span className={`font-medium ${
                              isItemActive 
                                ? "text-blue-900" 
                                : "text-slate-700"
                            }`}>
                              {item.title}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* {!collapsed && (
          <div className="mt-auto p-3 space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Notifications</span>
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                  3
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Nouvelles tâches assignées
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        )} */}

        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <Sparkles className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Depuis 1936</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}