import { NextRequest } from "next/server";
import { rapportService } from "@/services/rapport.service";

export const rapportController = {
  async list(_req: NextRequest) {
    try {
      const data = await rapportService.listWithPhotos(); // ← CHANGEMENT ICI
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Erreur lors de la récupération des rapports" }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const formData = await request.formData(); // ← CHANGEMENT ICI
      const description = formData.get('description') as string;
      const dateRapport = formData.get('dateRapport') as string;
      const avancement = parseInt(formData.get('avancement') as string);
      const idPhase = formData.get('idPhase') as string;
      
      // Récupérer les fichiers
      const photos: { buffer: Buffer; originalName: string }[] = [];
      const photoFiles = formData.getAll('photos') as File[];
      
      for (const file of photoFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        photos.push({
          buffer,
          originalName: file.name
        });
      }
      
      const rapportData = {
        description,
        dateRapport,
        avancement,
        idPhase,
        validation: "en_attente" as const
      };
      
      const result = await rapportService.createWithPhotos(rapportData, photos); // ← CHANGEMENT ICI
      return Response.json(result, { status: 201 });
    } catch (error) {
      console.error('Error creating rapport:', error);
      return Response.json({ error: "Erreur lors de la création du rapport" }, { status: 500 });
    }
  },

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const formData = await request.formData(); // ← CHANGEMENT ICI
      const description = formData.get('description') as string;
      const dateRapport = formData.get('dateRapport') as string;
      const avancement = parseInt(formData.get('avancement') as string);
      const idPhase = formData.get('idPhase') as string;
      
      // Récupérer les nouveaux fichiers
      const newPhotos: { buffer: Buffer; originalName: string }[] = [];
      const photoFiles = formData.getAll('photos') as File[];
      
      for (const file of photoFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        newPhotos.push({
          buffer,
          originalName: file.name
        });
      }
      
      const rapportData = {
        description,
        dateRapport,
        avancement,
        idPhase
      };
      
      const success = await rapportService.updateWithPhotos(params.id, rapportData, newPhotos); // ← CHANGEMENT ICI
      if (!success) {
        return Response.json({ error: "Rapport non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Rapport modifié avec succès" });
    } catch (error) {
      console.error('Error updating rapport:', error);
      return Response.json({ error: "Erreur lors de la modification du rapport" }, { status: 500 });
    }
  },

  async delete(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const success = await rapportService.delete(params.id);
      if (!success) {
        return Response.json({ error: "Rapport non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Rapport supprimé avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la suppression du rapport" }, { status: 500 });
    }
  },
};
