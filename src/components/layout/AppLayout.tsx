'use client'

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-foreground" />
              <h1 className="text-xl font-semibold text-foreground">
                Système de Gestion Infrastructure
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationBell role="chef_section" />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}