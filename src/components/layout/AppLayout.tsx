'use client'

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <AppSidebar />
        
        <SidebarInset className="flex flex-1 flex-col">
          {/* Header avec glassmorphism */}
          <header className="relative h-16 shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent pointer-events-none" />
            
            <div className={`relative h-full flex items-center justify-between px-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              {/* Left section */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors p-2" />
                
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-lg font-bold text-slate-800 leading-tight">
                      Système de Gestion Infrastructure
                    </h1>
                    <div className="hidden md:flex items-center gap-1.5 mt-1.5">
                      <p className="text-xs text-slate-500 font-medium">FCE · Depuis 1936</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right section */}
              <div className="flex items-center gap-2">
                {/* User info (optionnel si tu as l'info user) */}
                {user && (
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 mr-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-700 leading-none">{user.name || 'Utilisateur'}</p>
                      <p className="text-xs text-slate-500 leading-none mt-0.5">{user.role === 'chef_section' ? 'Chef de Section' : 'Chef de Brigade'}</p>
                    </div>
                  </div>
                )}
                
                {/* Notifications */}
                <div className="relative">
                  <NotificationBell role="chef_section" />
                </div>
                
                {/* Separator */}
                <div className="h-8 w-px bg-slate-200 mx-1" />
                
                {/* Logout button avec effet sophistiqué */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="group relative flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 border border-transparent hover:border-red-200"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  <span className="hidden sm:inline font-medium">Se déconnecter</span>
                  
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-lg" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-8">
              {/* Breadcrumb ou titre de page pourrait aller ici */}
              {children}
            </div>
          </main>
          
          {/* Footer subtil (optionnel) */}
          <footer className="h-12 shrink-0 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 h-full flex items-center justify-between">
              <p className="text-xs text-slate-500">
                © 2026 FCE · Tous droits réservés
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <a href="#" className="hover:text-slate-700 transition-colors">Support</a>
                <a href="#" className="hover:text-slate-700 transition-colors">Documentation</a>
                <a href="#" className="hover:text-slate-700 transition-colors">Confidentialité</a>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}