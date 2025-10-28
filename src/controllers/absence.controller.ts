import { NextRequest } from "next/server";
import { absenceService } from "@/services/absence.service";

export const absenceController = {
  async list(_req: NextRequest) {
    try {
      const data = await absenceService.list();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Erreur lors de la récupération des absences" }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const absence = await absenceService.create(body);
      return Response.json(absence, { status: 201 });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la création de l'absence" }, { status: 500 });
    }
  },

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const body = await request.json();
      const success = await absenceService.update(params.id, body);
      if (!success) {
        return Response.json({ error: "Absence non trouvée" }, { status: 404 });
      }
      return Response.json({ message: "Absence modifiée avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la modification de l'absence" }, { status: 500 });
    }
  },

  async delete(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const success = await absenceService.delete(params.id);
      if (!success) {
        return Response.json({ error: "Absence non trouvée" }, { status: 404 });
      }
      return Response.json({ message: "Absence supprimée avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la suppression de l'absence" }, { status: 500 });
    }
  },
};
