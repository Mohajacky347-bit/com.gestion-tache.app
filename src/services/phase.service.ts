import { phaseModel, PhaseEntity } from "@/models/phase.model";

export const phaseService = {
  async list(): Promise<PhaseEntity[]> {
    return phaseModel.findAll();
  },

  async get(id: string): Promise<PhaseEntity | null> {
    return phaseModel.findById(id);
  },

  async create(phase: Omit<PhaseEntity, 'id'>): Promise<PhaseEntity> {
    return phaseModel.create(phase);
  },

  async update(id: string, phase: Partial<PhaseEntity>): Promise<boolean> {
    return phaseModel.update(id, phase);
  },

  async delete(id: string): Promise<boolean> {
    return phaseModel.delete(id);
  },
};
