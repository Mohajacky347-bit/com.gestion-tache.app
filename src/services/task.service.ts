import { taskModel, TaskEntity, PhaseEntity } from "@/models/task.model";
import { brigadeModel } from "@/models/brigade.model";
import { equipeModel, EquipeMember } from "@/models/equipe.model";
import { notificationService } from "@/services/notification.service";
import { rapportService } from "@/services/rapport.service";

export interface TaskWithDetails {
  id: string;
  title: string;
  id_brigade: string;
  id_equipe: string;
  nom_brigade?: string;
  nom_equipe?: string;
  lieu?: string;
  materiels: { nom: string; quantite: number }[];
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  status: "pending" | "paused" | "progress" | "completed";
  phases: Phase[];
  equipeMembres?: EquipeMember[];
  rapports?: Array<{
    id: string;
    description: string;
    dateRapport: string;
    avancement: number;
    validation: string;
    phaseNom?: string;
  }>;
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
  async list(filters?: { brigadeId?: number; equipeId?: number }): Promise<TaskWithDetails[]> {
    const tasks = await taskModel.findAll(filters);
    
    const tasksWithDetails: TaskWithDetails[] = [];
    
    for (const task of tasks) {
      // Récupérer les noms de brigade et équipe
      let nom_brigade: string | undefined;
      let nom_equipe: string | undefined;
      
      if (task.id_brigade) {
        const brigade = await brigadeModel.findById(task.id_brigade);
        nom_brigade = brigade?.nom_brigade;
      }
      
      if (task.id_equipe) {
        const equipe = await equipeModel.findById(task.id_equipe);
        nom_equipe = equipe?.nom_equipe;
      }
      
      const materiels = await taskModel.getMaterielsByTask(task.id);
      const phases = await taskModel.getPhasesByTask(task.id);
      
      tasksWithDetails.push({
        id: task.id,
        title: task.description,
        id_brigade: task.id_brigade?.toString() || "",
        id_equipe: task.id_equipe?.toString() || "",
        nom_brigade,
        nom_equipe,
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
    
    // Récupérer les noms de brigade et équipe
    let nom_brigade: string | undefined;
    let nom_equipe: string | undefined;
    let lieu: string | undefined;
    let equipeMembres: EquipeMember[] | undefined;
    
    if (task.id_brigade) {
      const brigade = await brigadeModel.findById(task.id_brigade);
      nom_brigade = brigade?.nom_brigade;
      lieu = brigade?.lieu;
    }
    
    if (task.id_equipe) {
      const equipe = await equipeModel.findById(task.id_equipe);
      nom_equipe = equipe?.nom_equipe;
      
      // Récupérer les membres de l'équipe
      if (task.id_brigade) {
        const equipesWithMembers = await equipeModel.findWithMembersByBrigade(task.id_brigade);
        const equipeFound = equipesWithMembers.find(e => e.id_equipe === task.id_equipe);
        equipeMembres = equipeFound?.members || [];
      }
    }
    
    const materiels = await taskModel.getMaterielsByTask(id);
    const phases = await taskModel.getPhasesByTask(id);
    
    // Récupérer les rapports associés à cette tâche
    const rapportsData = await rapportService.getByTaskId(id);
    const rapports = rapportsData.map(rapport => ({
      id: rapport.id,
      description: rapport.description,
      dateRapport: rapport.dateRapport,
      avancement: rapport.avancement,
      validation: rapport.validation,
      phaseNom: rapport.phaseNom
    }));
    
    return {
      id: task.id,
      title: task.description,
      id_brigade: task.id_brigade?.toString() || "",
      id_equipe: task.id_equipe?.toString() || "",
      nom_brigade,
      nom_equipe,
      lieu,
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
      })),
      equipeMembres,
      rapports
    };
  },

  async create(data: Omit<TaskWithDetails, "id">): Promise<TaskWithDetails> {
    const taskEntity: Omit<TaskEntity, "id"> = {
      description: data.title,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      dateFinReel: data.dateFinReel,
      statut: mapStatusToStatut(data.status),
      id_brigade: data.id_brigade ? parseInt(data.id_brigade) : undefined,
      id_equipe: data.id_equipe ? parseInt(data.id_equipe) : undefined
    };
    
    const createdTask = await taskModel.create(taskEntity);
    
    // Créer les relations avec les matériels
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
    
    // Récupérer les noms pour la réponse
    let nom_brigade: string | undefined;
    let nom_equipe: string | undefined;
    
    if (data.id_brigade) {
      const brigade = await brigadeModel.findById(parseInt(data.id_brigade));
      nom_brigade = brigade?.nom_brigade;
    }
    
    if (data.id_equipe) {
      const equipe = await equipeModel.findById(parseInt(data.id_equipe));
      nom_equipe = equipe?.nom_equipe;
    }
    
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
      id: createdTask.id,
      nom_brigade,
      nom_equipe
    };
  },

  async update(id: string, data: Omit<TaskWithDetails, "id">): Promise<TaskWithDetails | null> {
    const taskEntity: Omit<TaskEntity, "id"> = {
      description: data.title,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      dateFinReel: data.dateFinReel,
      statut: mapStatusToStatut(data.status),
      id_brigade: data.id_brigade ? parseInt(data.id_brigade) : undefined,
      id_equipe: data.id_equipe ? parseInt(data.id_equipe) : undefined
    };
    
    const success = await taskModel.update(id, taskEntity);
    
    if (!success) {
      return null;
    }
    
    await taskModel.assignMateriels(id, data.materiels);
    
    const phaseEntities: Omit<PhaseEntity, "id" | "idTache">[] = data.phases.map(phase => ({
      nom: phase.nom,
      description: phase.description,
      dureePrevue: phase.dureePrevue,
      dateDebut: phase.dateDebut,
      dateFin: phase.dateFin,
      statut: phase.statut
    }));
    
    await taskModel.createPhases(id, phaseEntities);

    return this.get(id);
  },

  async delete(id: string): Promise<boolean> {
    return taskModel.delete(id);
  },

  async getMaterialsByBrigade(id_brigade: number) {
    return taskModel.findMaterialsByBrigade(id_brigade);
  }
};