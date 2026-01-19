'use client'

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  ClipboardList,
  GitBranch,
  Users, 
  Wrench, 
  CalendarRange,
  FileText,
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
import { cn } from "@/lib/utils";

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
    url: "#",
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

interface AppSidebarProps {
  collapsed?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ collapsed = false, onClose }: AppSidebarProps) {
  const currentPath = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'gestion-des-employés': true
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    if (path === "#") return false; // Les liens "#" ne sont jamais actifs
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const isParentActive = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.url));
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const getMenuKey = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <aside className="w-64 h-screen bg-card border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <div className="relative h-8 w-8">
              <Image 
                src="/fce.jpeg" 
                alt="FCE" 
                fill
                className="rounded object-cover"
                sizes="32px"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">Infrastructure</h2>
            <p className="text-xs text-muted-foreground">Gare Fianarantsoa</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-2">
          <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Navigation
          </span>
        </div>
        
        <div className="space-y-1">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const active = isActive(item.url);
            const parentActive = hasChildren && isParentActive(item);
            const menuKey = getMenuKey(item.title);
            const isMenuOpen = openMenus[menuKey] ?? false;

            return (
              <div key={item.title} className="mb-1">
                {hasChildren ? (
                  <div className="relative">
                    {/* Bouton parent avec toggle */}
                    <button
                      type="button"
                      onClick={() => toggleMenu(menuKey)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ml-[3px]",
                        // Le parent n'est JAMAIS coloré en bleu, seulement au hover
                        "hover:bg-secondary text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Users className={cn(
                          "h-5 w-5 transition-colors flex-shrink-0",
                          // L'icône n'est jamais colorée en bleu
                          "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "font-medium text-left",
                          // Le texte n'est jamais coloré en bleu
                          "text-foreground"
                        )}>
                          {item.title}
                        </span>
                      </div>
                      <div className={cn(
                        "p-1 rounded transition-colors flex-shrink-0",
                        "text-muted-foreground"
                      )}>
                        {isMenuOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </button>

                    {/* Sous-menus */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: isMenuOpen ? "auto" : 0,
                        opacity: isMenuOpen ? 1 : 0,
                        marginTop: isMenuOpen ? "4px" : "0px"
                      }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-[3px]"
                    >
                      <div className="ml-7 space-y-0.5 pl-4 border-l border-border/50">
                        {item.children!.map((child) => {
                          const childActive = isActive(child.url);
                          return (
                            <div key={child.title} className="relative">
                              {/* Indicateur actif pour le sous-menu */}
                              {childActive && (
                                <motion.div 
                                  layoutId={`child-active-${child.url}`}
                                  className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full gradient-primary"
                                  initial={false}
                                />
                              )}
                              
                              <Link
                                href={child.url}
                                onClick={handleNavClick}
                                className={cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150",
                                  childActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                              >
                                <child.icon className={cn(
                                  "h-4 w-4 flex-shrink-0 ml-1",
                                  childActive 
                                    ? "text-primary" 
                                    : "text-muted-foreground"
                                )} />
                                <span>{child.title}</span>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* Lien simple sans enfants */
                  <div className="relative">
                    {/* Indicateur actif pour les liens simples */}
                    {active && (
                      <motion.div 
                        layoutId={`active-${item.url}`}
                        className="absolute left-0 top-0 h-full w-[3px] rounded-r-full gradient-primary"
                        initial={false}
                      />
                    )}
                    
                    <Link
                      href={item.url}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ml-[3px]",
                        active
                          ? "bg-primary/10"
                          : "hover:bg-secondary"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors flex-shrink-0",
                        active 
                          ? "text-primary" 
                          : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "font-medium",
                        active 
                          ? "text-primary" 
                          : "text-foreground"
                      )}>
                        {item.title}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-secondary border border-border/50">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Depuis 1936</span>
        </div>
      </div>
    </aside>
  );
}