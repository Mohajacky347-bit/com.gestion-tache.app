import { NextRequest } from "next/server";
import { brigadeService } from "@/services/brigade.service";

export const brigadeController = {
  async list(_req: NextRequest) {
    try {
      const data = await brigadeService.list();
      return Response.json(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des brigades:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des brigades" },
        { status: 500 }
      );
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const { nom_brigade, lieu } = body ?? {};

      if (!nom_brigade || !lieu) {
        return Response.json(
          { error: "Les champs nom_brigade et lieu sont requis" },
          { status: 400 }
        );
      }

      const brigade = await brigadeService.create({ nom_brigade, lieu });
      return Response.json(brigade, { status: 201 });
    } catch (error) {
      console.error("Erreur lors de la création de la brigade:", error);
      return Response.json(
        { error: "Erreur lors de la création de la brigade" },
        { status: 500 }
      );
    }
  },
};


