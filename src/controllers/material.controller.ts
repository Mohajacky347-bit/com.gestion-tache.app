import { NextRequest } from "next/server";
import { materialService } from "@/services/material.service";

export const materialController = {
  async list(_req: NextRequest) {
    try {
      const data = await materialService.list();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Erreur lors de la récupération des matériels" }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const material = await materialService.create(body);
      return Response.json(material, { status: 201 });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la création du matériel" }, { status: 500 });
    }
  },

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const body = await request.json();
      const success = await materialService.update(params.id, body);
      if (!success) {
        return Response.json({ error: "Matériel non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Matériel modifié avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la modification du matériel" }, { status: 500 });
    }
  },

  async delete(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const success = await materialService.delete(params.id);
      if (!success) {
        return Response.json({ error: "Matériel non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Matériel supprimé avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la suppression du matériel" }, { status: 500 });
    }
  },
};
