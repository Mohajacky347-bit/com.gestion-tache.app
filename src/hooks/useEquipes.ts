import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Equipe {
  id_equipe: number;
  nom_equipe: string;
  specialite: string;
  id_brigade: number;
}

// Hook pour récupérer toutes les équipes
export function useEquipes(brigadeId?: string | number) {
  return useQuery({
    queryKey: ['equipes', brigadeId],
    queryFn: async () => {
      const url = brigadeId 
        ? `/api/equipes?brigade=${brigadeId}`
        : '/api/equipes';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur lors du chargement des équipes');
      return res.json() as Promise<Equipe[]>;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

// Hook pour créer une équipe
export function useCreateEquipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (equipeData: Omit<Equipe, 'id_equipe'>) => {
      const res = await fetch('/api/equipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipeData),
      });
      if (!res.ok) throw new Error('Erreur lors de la création de l\'équipe');
      return res.json() as Promise<Equipe>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      queryClient.invalidateQueries({ queryKey: ['equipes', data.id_brigade] });
    },
  });
}
