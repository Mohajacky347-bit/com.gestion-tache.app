import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Task {
  id: string;
  title: string;
  id_brigade: string;
  id_equipe: string;
  nom_brigade?: string;
  nom_equipe?: string;
  materiels: { nom: string; quantite: number }[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: 'pending' | 'paused' | 'progress' | 'completed';
  phases: Phase[];
}

export interface Phase {
  id?: string;
  nom: string;
  description: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: 'En attente' | 'En cours' | 'Terminé';
}

// Hook pour récupérer toutes les tâches
export function useTasks(brigadeId?: number, equipeId?: number) {
  return useQuery({
    queryKey: ['tasks', brigadeId, equipeId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (brigadeId) params.append('brigadeId', brigadeId.toString());
      if (equipeId) params.append('equipeId', equipeId.toString());
      
      const url = `/api/taches${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur lors du chargement des tâches');
      return res.json() as Promise<Task[]>;
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer une tâche spécifique
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const res = await fetch(`/api/taches/${id}`);
      if (!res.ok) throw new Error('Erreur lors du chargement de la tâche');
      return res.json() as Promise<Task>;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// Hook pour créer une tâche
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskData: Omit<Task, 'id'>) => {
      const res = await fetch('/api/taches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error('Erreur lors de la création de la tâche');
      return res.json() as Promise<Task>;
    },
    onSuccess: () => {
      // Invalider et refetch les listes de tâches
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Hook pour mettre à jour une tâche
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...taskData }: Partial<Task> & { id: string }) => {
      const res = await fetch('/api/taches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...taskData }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour de la tâche');
      return res.json() as Promise<Task>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
    },
  });
}

// Hook pour supprimer une tâche
export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/taches?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression de la tâche');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
