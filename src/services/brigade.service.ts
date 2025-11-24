import { brigadeModel, BrigadeEntity } from "@/models/brigade.model";

export const brigadeService = {
  async list(): Promise<BrigadeEntity[]> {
    return brigadeModel.findAll();
  },

  async findById(id: number): Promise<BrigadeEntity | null> {
    return brigadeModel.findById(id);
  },

  async create(brigade: Pick<BrigadeEntity, "nom_brigade" | "lieu">): Promise<BrigadeEntity> {
    return brigadeModel.create(brigade);
  },

  async update(id: number, brigade: Partial<Pick<BrigadeEntity, "nom_brigade" | "lieu">>): Promise<boolean> {
    return brigadeModel.update(id, brigade);
  },

  async delete(id: number): Promise<boolean> {
    return brigadeModel.delete(id);
  },
};


