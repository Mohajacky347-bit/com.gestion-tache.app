import { absenceModel, AbsenceEntity } from "@/models/absence.model";

export const absenceService = {
  async list(): Promise<AbsenceEntity[]> {
    return absenceModel.findAll();
  },

  async get(id: string): Promise<AbsenceEntity | null> {
    return absenceModel.findById(id);
  },

  async create(absence: Omit<AbsenceEntity, 'id'>): Promise<AbsenceEntity> {
    return absenceModel.create(absence);
  },

  async update(id: string, absence: Partial<AbsenceEntity>): Promise<boolean> {
    return absenceModel.update(id, absence);
  },

  async delete(id: string): Promise<boolean> {
    return absenceModel.delete(id);
  },
};
