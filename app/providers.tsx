'use client'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Données considérées comme "fresh" pendant 30 secondes
        staleTime: 30 * 1000,
        // Cache les données pendant 5 minutes
        gcTime: 5 * 60 * 1000,
        // Réessayer en cas d'erreur
        retry: 1,
        // Désactiver le refetch au focus pour améliorer les performances
        refetchOnWindowFocus: false,
        // Désactiver le refetch à la reconnexion
        refetchOnReconnect: false,
        // Désactiver le refetch au mount si les données sont fraîches
        refetchOnMount: false,
      },
      mutations: {
        // Réessayer une fois en cas d'erreur
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
