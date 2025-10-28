import { materialModel, MaterialEntity } from "@/models/material.model";

export const materialService = {
  async list(): Promise<MaterialEntity[]> {
    return materialModel.findAll();
  },

  async get(id: string): Promise<MaterialEntity | null> {
    return materialModel.findById(id);
  },

  async create(material: Omit<MaterialEntity, 'id'>): Promise<MaterialEntity> {
    return materialModel.create(material);
  },

  async update(id: string, material: Partial<MaterialEntity>): Promise<boolean> {
    return materialModel.update(id, material);
  },

  async delete(id: string): Promise<boolean> {
    return materialModel.delete(id);
  },
};
