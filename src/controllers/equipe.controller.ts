import { NextRequest } from "next/server";
import { equipeService } from "@/services/equipe.service";

export const equipeController = {
  async list(_req: NextRequest) {
    try {
      const data = await equipeService.list();
      return Response.json(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des équipes" },
        { status: 500 }
      );
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const { nom_equipe, specialite, id_brigade } = body ?? {};

      if (!nom_equipe || !specialite || !id_brigade) {
        return Response.json(
          { error: "nom_equipe, specialite et id_brigade sont requis" },
          { status: 400 }
        );
      }

      const equipe = await equipeService.create({
        nom_equipe,
        specialite,
        id_brigade: Number(id_brigade),
      });
      return Response.json(equipe, { status: 201 });
    } catch (error) {
      console.error("Erreur lors de la création d'une équipe:", error);
      return Response.json(
        { error: "Erreur lors de la création de l'équipe" },
        { status: 500 }
      );
    }
  },
};


