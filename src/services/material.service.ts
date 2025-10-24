import { materialModel, MaterialEntity } from "@/models/material.model";

export const materialService = {
  async list(): Promise<MaterialEntity[]> {
    return materialModel.findAll();
  },

  async get(id: string): Promise<MaterialEntity | null> {
    return materialModel.findById(id);
  },
};



