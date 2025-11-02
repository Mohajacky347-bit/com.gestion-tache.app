import { rapportModel, RapportEntity } from "@/models/rapport.model";
import { PhotoEntity } from "./photo.service";

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

  // Pour gérer les photo
  async createWithPhotos(rapport: Omit<RapportEntity, 'id'>, photos: { buffer: Buffer; originalName: string }[]): Promise<{ rapport: RapportEntity; photos: PhotoEntity[] }> {
    return rapportModel.createWithPhotos(rapport, photos);
  },

  async updateWithPhotos(id: string, rapport: Partial<RapportEntity>, newPhotos: { buffer: Buffer; originalName: string }[]): Promise<boolean> {
    return rapportModel.updateWithPhotos(id, rapport, newPhotos);
  },

  async getWithPhotos(id: string): Promise<(RapportEntity & { photos: PhotoEntity[] }) | null> {
    return rapportModel.findByIdWithPhotos(id);
  },

  async listWithPhotos(): Promise<(RapportEntity & { photos: PhotoEntity[] })[]> {
    return rapportModel.findAllWithPhotos();
  },

  async updateValidation(id: string, validation: "En attente" | "À réviser" | "Approuvé", commentaire?: string): Promise<boolean> {
    return rapportModel.updateValidation(id, validation, commentaire);
  }
};