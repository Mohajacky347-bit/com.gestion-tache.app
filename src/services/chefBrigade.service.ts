import { chefBrigadeModel, ChefBrigadeEntity } from "@/models/chefBrigade.model";

export const chefBrigadeService = {
  async list(): Promise<ChefBrigadeEntity[]> {
    return chefBrigadeModel.findAll();
  },

  async create(data: { id_employe: string; id_brigade: number; date_nomination?: string }): Promise<void> {
    return chefBrigadeModel.create(data);
  },

  async delete(id_employe: string): Promise<boolean> {
    return chefBrigadeModel.delete(id_employe);
  },

  async findByEmploye(id_employe: string): Promise<ChefBrigadeEntity | null> {
    return chefBrigadeModel.findByEmploye(id_employe);
  },
};


