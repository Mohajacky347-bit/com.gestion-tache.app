import { equipeModel, EquipeEntity, EquipeWithMembers } from "@/models/equipe.model";

export const equipeService = {
  async list(): Promise<EquipeEntity[]> {
    return equipeModel.findAll();
  },

  async findById(id: number): Promise<EquipeEntity | null> {
    return equipeModel.findById(id);
  },

  async findByBrigade(id_brigade: number): Promise<EquipeEntity[]> {
    return equipeModel.findByBrigade(id_brigade);
  },

  async create(equipe: Omit<EquipeEntity, 'id_equipe' | 'brigade_nom' | 'membres'>): Promise<EquipeEntity> {
    return equipeModel.create(equipe);
  },

  async update(id: number, equipe: Partial<Omit<EquipeEntity, 'id_equipe' | 'brigade_nom' | 'membres'>>): Promise<boolean> {
    return equipeModel.update(id, equipe);
  },

  async delete(id: number): Promise<boolean> {
    return equipeModel.delete(id);
  },

  async getWithMembersByBrigade(id_brigade: number): Promise<EquipeWithMembers[]> {
    return equipeModel.findWithMembersByBrigade(id_brigade);
  },
};