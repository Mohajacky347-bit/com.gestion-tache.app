import { NextRequest } from "next/server";
import { phaseService } from "@/services/phase.service";

export const phaseController = {
  async list(_req: NextRequest) {
    try {
      const data = await phaseService.list();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Erreur lors de la récupération des phases" }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const phase = await phaseService.create(body);
      return Response.json(phase, { status: 201 });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la création de la phase" }, { status: 500 });
    }
  },

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const body = await request.json();
      const success = await phaseService.update(params.id, body);
      if (!success) {
        return Response.json({ error: "Phase non trouvée" }, { status: 404 });
      }
      return Response.json({ message: "Phase modifiée avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la modification de la phase" }, { status: 500 });
    }
  },

  async delete(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const success = await phaseService.delete(params.id);
      if (!success) {
        return Response.json({ error: "Phase non trouvée" }, { status: 404 });
      }
      return Response.json({ message: "Phase supprimée avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la suppression de la phase" }, { status: 500 });
    }
  },
};
