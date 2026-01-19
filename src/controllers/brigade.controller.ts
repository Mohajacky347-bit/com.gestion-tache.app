import { NextRequest } from "next/server";
import { brigadeService } from "@/services/brigade.service";
import { cachedResponse } from "@/lib/api-helpers";

export const brigadeController = {
  async list(_req: NextRequest) {
    try {
      const data = await brigadeService.list();
      // Cache de 5 minutes pour les brigades (données qui changent rarement)
      return cachedResponse(data, 300);
    } catch (error) {
      console.error("Erreur lors de la récupération des brigades:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des brigades" },
        { status: 500 }
      );
    }
  },

  // AJOUTEZ CETTE NOUVELLE MÉTHODE
  async getById(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return Response.json(
          { error: "ID manquant" },
          { status: 400 }
        );
      }
      
      const brigade = await brigadeService.findById(parseInt(id));
      
      if (!brigade) {
        return Response.json(
          { error: "Brigade non trouvée" },
          { status: 404 }
        );
      }
      
      return Response.json(brigade);
    } catch (error) {
      console.error("Erreur récupération brigade:", error);
      return Response.json(
        { error: "Erreur lors de la récupération de la brigade" },
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

  async equipes(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        return Response.json({ error: "ID de brigade invalide" }, { status: 400 });
      }

      const equipes = await brigadeService.getEquipesWithMembers(id);
      return Response.json(equipes);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des équipes de la brigade" },
        { status: 500 }
      );
    }
  },

  async materiels(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        return Response.json({ error: "ID de brigade invalide" }, { status: 400 });
      }

      const materiels = await brigadeService.getMaterialsForBrigade(id);
      return Response.json(materiels);
    } catch (error) {
      console.error("Erreur lors de la récupération des matériels par brigade:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des matériels" },
        { status: 500 }
      );
    }
  },
};