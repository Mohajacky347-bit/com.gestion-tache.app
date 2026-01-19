import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Brigade {
  id_brigade: number;
  nom_brigade: string;
  lieu: string;
}

// Hook pour récupérer toutes les brigades
export function useBrigades() {
  return useQuery({
    queryKey: ['brigades'],
    queryFn: async () => {
      const res = await fetch('/api/brigades');
      if (!res.ok) throw new Error('Erreur lors du chargement des brigades');
      return res.json() as Promise<Brigade[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - les brigades changent rarement
    gcTime: 10 * 60 * 1000,
  });
}

// Hook pour récupérer une brigade spécifique
export function useBrigade(id: number) {
  return useQuery({
    queryKey: ['brigade', id],
    queryFn: async () => {
      const res = await fetch(`/api/brigades/${id}`);
      if (!res.ok) throw new Error('Erreur lors du chargement de la brigade');
      return res.json() as Promise<Brigade>;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour créer une brigade
export function useCreateBrigade() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (brigadeData: Omit<Brigade, 'id_brigade'>) => {
      const res = await fetch('/api/brigades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brigadeData),
      });
      if (!res.ok) throw new Error('Erreur lors de la création de la brigade');
      return res.json() as Promise<Brigade>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brigades'] });
    },
  });
}
