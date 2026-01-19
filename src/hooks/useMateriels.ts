import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Materiel {
  id: string;
  nom: string;
  type: string;
  disponible: boolean;
  quantite: number;
}

// Hook pour récupérer tous les matériels
export function useMateriels() {
  return useQuery({
    queryKey: ['materiels'],
    queryFn: async () => {
      const res = await fetch('/api/materiels');
      if (!res.ok) throw new Error('Erreur lors du chargement des matériels');
      return res.json() as Promise<Materiel[]>;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - les matériels peuvent changer fréquemment
    gcTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer un matériel spécifique
export function useMateriel(id: string) {
  return useQuery({
    queryKey: ['materiel', id],
    queryFn: async () => {
      const res = await fetch(`/api/materiels/${id}`);
      if (!res.ok) throw new Error('Erreur lors du chargement du matériel');
      return res.json() as Promise<Materiel>;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

// Hook pour créer un matériel
export function useCreateMateriel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (materielData: Omit<Materiel, 'id'>) => {
      const res = await fetch('/api/materiels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materielData),
      });
      if (!res.ok) throw new Error('Erreur lors de la création du matériel');
      return res.json() as Promise<Materiel>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiels'] });
    },
  });
}

// Hook pour mettre à jour un matériel
export function useUpdateMateriel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...materielData }: Partial<Materiel> & { id: string }) => {
      const res = await fetch(`/api/materiels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materielData),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour du matériel');
      return res.json() as Promise<Materiel>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materiels'] });
      queryClient.invalidateQueries({ queryKey: ['materiel', data.id] });
    },
  });
}

// Hook pour supprimer un matériel
export function useDeleteMateriel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/materiels/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression du matériel');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiels'] });
    },
  });
}
