import { employeModel, EmployeEntity } from "@/models/employe.model";
import { chefBrigadeService } from "@/services/chefBrigade.service";
import { employeEquipeService } from "@/services/employeEquipe.service";

export const employeService = {
  async list(): Promise<EmployeEntity[]> {
    return employeModel.findAll();
  },

  async get(id: string): Promise<EmployeEntity | null> {
    return employeModel.findById(id);
  },

  async create(employe: Omit<EmployeEntity, 'id'> & { 
    isChefBrigade?: boolean; 
    id_brigade?: number;
    isChefMagasinier?: boolean;
    id_equipe?: number;
  }): Promise<EmployeEntity> {
    // Extraire les champs spéciaux avant de passer au model
    const { isChefBrigade, id_brigade, isChefMagasinier, id_equipe, ...employeData } = employe;
    
    // Si c'est un chef magasinier, mettre à jour la spécialité
    if (isChefMagasinier) {
      employeData.specialite = "Chef magasinier";
    }
    
    // Créer l'employé
    const newEmploye = await employeModel.create(employeData);
    
    // Si c'est un chef de brigade, l'ajouter à la table chefbrigade
    if (isChefBrigade && id_brigade) {
      try {
        await chefBrigadeService.create({
          id_employe: newEmploye.id,
          id_brigade: id_brigade,
          date_nomination: new Date().toISOString().split('T')[0]
        });
      } catch (error: any) {
        console.error('Error creating chef brigade:', error);
        // Si l'ajout dans chefbrigade échoue (ex: brigade a déjà un chef), on lance l'erreur
        // pour que l'utilisateur soit informé
        throw new Error(
          error.message?.includes('Duplicate') || error.message?.includes('UNIQUE')
            ? 'Cette brigade a déjà un chef de brigade'
            : 'Erreur lors de la nomination du chef de brigade'
        );
      }
    }
    
    // Si c'est un simple employé avec une équipe, l'assigner à l'équipe
    if (!isChefBrigade && !isChefMagasinier && id_equipe) {
      try {
        await employeEquipeService.assignToEquipe(newEmploye.id, id_equipe);
      } catch (error: any) {
        console.error('Error assigning employe to equipe:', error);
        throw new Error('Erreur lors de l\'assignation de l\'employé à l\'équipe');
      }
    }
    
    return newEmploye;
  },

  async update(id: string, employe: Partial<EmployeEntity>): Promise<boolean> {
    return employeModel.update(id, employe);
  },

  async delete(id: string): Promise<boolean> {
    // Supprimer aussi l'entrée dans chefbrigade si elle existe
    try {
      await chefBrigadeService.delete(id);
    } catch (error) {
      console.error('Error deleting chef brigade:', error);
    }
    // Supprimer aussi l'assignation à l'équipe si elle existe
    try {
      await employeEquipeService.removeFromEquipe(id);
    } catch (error) {
      console.error('Error removing from equipe:', error);
    }
    return employeModel.delete(id);
  },
};