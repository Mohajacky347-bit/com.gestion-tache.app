import { NextRequest } from "next/server";
import { rapportService } from "@/services/rapport.service";

export const rapportController = {
  async list(_req: NextRequest) {
    try {
      const data = await rapportService.list();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Erreur lors de la récupération des rapports" }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      
      // S'assurer que le statut est "en_attente" pour les nouveaux rapports
      const rapportData = {
        ...body,
        validation: "en_attente" as const
      };
      
      const rapport = await rapportService.create(rapportData);
      return Response.json(rapport, { status: 201 });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la création du rapport" }, { status: 500 });
    }
  },

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const body = await request.json();
      const success = await rapportService.update(params.id, body);
      if (!success) {
        return Response.json({ error: "Rapport non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Rapport modifié avec succès" });
    } catch (error) {
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
