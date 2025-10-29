import { rapportModel, RapportEntity } from "@/models/rapport.model";

export const rapportService = {
  async list(): Promise<RapportEntity[]> {
    return rapportModel.findAll();
  },

  async get(id: string): Promise<RapportEntity | null> {
    return rapportModel.findById(id);
  },

  async create(rapport: Omit<RapportEntity, 'id'>): Promise<RapportEntity> {
    return rapportModel.create(rapport);
  },

  async update(id: string, rapport: Partial<RapportEntity>): Promise<boolean> {
    return rapportModel.update(id, rapport);
  },

  async delete(id: string): Promise<boolean> {
    return rapportModel.delete(id);
  },
};