import { taskModel, TaskEntity, PhaseEntity } from "@/models/task.model";
import { notificationService } from "@/services/notification.service";

export interface TaskWithDetails {
  id: string;
  title: string;
  employes: string[];
  materiels: { nom: string; quantite: number }[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: "pending" | "paused" | "progress" | "completed";
  phases: Phase[];
}

interface Phase {
  id?: string;
  nom: string;
  description: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: "En attente" | "En cours" | "Terminé";
}

const mapStatutToStatus = (statut: string): "pending" | "paused" | "progress" | "completed" => {
  switch (statut) {
    case "En attente": return "pending";
    case "En cours": return "progress";
    case "Terminé": return "completed";
    case "En pause": return "paused";
    default: return "pending";
  }
};

const mapStatusToStatut = (status: "pending" | "paused" | "progress" | "completed"): string => {
  switch (status) {
    case "pending": return "En attente";
    case "progress": return "En cours";
    case "completed": return "Terminé";
    case "paused": return "En pause";
    default: return "En attente";
  }
};

export const taskService = {
  async list(): Promise<TaskWithDetails[]> {
    const tasks = await taskModel.findAll();
    
    const tasksWithDetails: TaskWithDetails[] = [];
    
    for (const task of tasks) {
      const employes = await taskModel.getEmployesByTask(task.id);
      const materiels = await taskModel.getMaterielsByTask(task.id);
      const phases = await taskModel.getPhasesByTask(task.id);
      
      tasksWithDetails.push({
        id: task.id,
        title: task.description,
        employes,
        materiels,
        dateDebut: task.dateDebut,
        dateFin: task.dateFin,
        dateFinReel: task.dateFinReel,
        status: mapStatutToStatus(task.statut),
        phases: phases.map(phase => ({
          id: phase.id,
          nom: phase.nom,
          description: phase.description,
          dureePrevue: phase.dureePrevue,
          dateDebut: phase.dateDebut,
          dateFin: phase.dateFin,
          statut: phase.statut as "En attente" | "En cours" | "Terminé"
        }))
      });
    }
    
    return tasksWithDetails;
  },

  async get(id: string): Promise<TaskWithDetails | null> {
    const task = await taskModel.findById(id);
    if (!task) return null;
    
    const employes = await taskModel.getEmployesByTask(id);
    const materiels = await taskModel.getMaterielsByTask(id);
    const phases = await taskModel.getPhasesByTask(id);
    
    return {
      id: task.id,
      title: task.description,
      employes,
      materiels,
      dateDebut: task.dateDebut,
      dateFin: task.dateFin,
      dateFinReel: task.dateFinReel,
      status: mapStatutToStatus(task.statut),
      phases: phases.map(phase => ({
        id: phase.id,
        nom: phase.nom,
        description: phase.description,
        dureePrevue: phase.dureePrevue,
        dateDebut: phase.dateDebut,
        dateFin: phase.dateFin,
        statut: phase.statut as "En attente" | "En cours" | "Terminé"
      }))
    };
  },

  async create(data: Omit<TaskWithDetails, "id">): Promise<TaskWithDetails> {
    const taskEntity: Omit<TaskEntity, "id"> = {
      description: data.title,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      dateFinReel: data.dateFinReel,
      statut: mapStatusToStatut(data.status)
    };
    
    const createdTask = await taskModel.create(taskEntity);
    
    // Créer les relations
    await taskModel.assignEmployes(createdTask.id, data.employes);
    await taskModel.assignMateriels(createdTask.id, data.materiels);
    
    // Créer les phases
    const phaseEntities: Omit<PhaseEntity, "id" | "idTache">[] = data.phases.map(phase => ({
      nom: phase.nom,
      description: phase.description,
      dureePrevue: phase.dureePrevue,
      dateDebut: phase.dateDebut,
      dateFin: phase.dateFin,
      statut: phase.statut
    }));
    
    await taskModel.createPhases(createdTask.id, phaseEntities);
    
    try {
      await notificationService.createForRole({
        title: "Nouvelle tâche ajoutée",
        message: `La tâche "${data.title}" a été planifiée par le chef de section.`,
        targetRole: "chef_brigade",
        payload: {
          taskId: createdTask.id,
          redirectTo: `/brigade/taches/${createdTask.id}`,
        },
      });
    } catch (error) {
      console.error("Impossible de notifier le chef de brigade:", error);
    }

    return {
      ...data,
      id: createdTask.id
    };
  },

  async update(id: string, data: Omit<TaskWithDetails, "id">): Promise<boolean> {
    const taskEntity: Omit<TaskEntity, "id"> = {
      description: data.title,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      dateFinReel: data.dateFinReel,
      statut: mapStatusToStatut(data.status)
    };
    
    const success = await taskModel.update(id, taskEntity);
    
    if (success) {
      // Mettre à jour les relations
      await taskModel.assignEmployes(id, data.employes);
      await taskModel.assignMateriels(id, data.materiels);
      
      // Mettre à jour les phases
      const phaseEntities: Omit<PhaseEntity, "id" | "idTache">[] = data.phases.map(phase => ({
        nom: phase.nom,
        description: phase.description,
        dureePrevue: phase.dureePrevue,
        dateDebut: phase.dateDebut,
        dateFin: phase.dateFin,
        statut: phase.statut
      }));
      
      await taskModel.createPhases(id, phaseEntities);
    }
    
    return success;
  },

  async delete(id: string): Promise<boolean> {
    return taskModel.delete(id);
  }
};
