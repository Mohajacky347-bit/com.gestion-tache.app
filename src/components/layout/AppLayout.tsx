'use client'

import { useState, useEffect, ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { 
  Bell, 
  LogOut, 
  Sparkles,
  User
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar fixe */}
        <div className="sticky top-0 left-0 h-screen">
          <AppSidebar />
        </div>
        
        {/* Contenu principal avec défilement indépendant */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-20 h-16 shrink-0 border-b border-border/50 bg-card/80 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />
            
            <div className={`relative h-full flex items-center justify-between px-4 lg:px-6 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {/* Left section */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors p-2" />
                
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-lg font-bold text-foreground leading-tight">
                      Système de Gestion Infrastructure
                    </h1>
                    <div className="hidden md:flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <p className="text-xs text-muted-foreground font-medium">FCE · Depuis 1936</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right section */}
              <div className="flex items-center gap-2">
                {/* User info */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border/50 mr-2">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground leading-none">Admin</p>
                    <p className="text-xs text-muted-foreground leading-none mt-0.5">Chef de Section</p>
                  </div>
                </div>
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground">
                    3
                  </span>
                </Button>
                
                {/* Separator */}
                <div className="h-8 w-px bg-border mx-1 hidden sm:block" />
                
                {/* Logout button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="group relative flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-300 border border-transparent hover:border-destructive/20"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="hidden sm:inline font-medium">Déconnexion</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content - DÉFILEMENT ICI SEULEMENT */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
              {children}
            </div>
          </main>
          
          {/* Footer */}
          <footer className="shrink-0 border-t border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 lg:px-6 py-3 h-12 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                © 2026 FCE · Tous droits réservés
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="hover:text-foreground transition-colors cursor-pointer">Support</span>
                <span className="hover:text-foreground transition-colors cursor-pointer">Documentation</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}