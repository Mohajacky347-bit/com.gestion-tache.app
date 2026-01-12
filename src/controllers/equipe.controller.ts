import { NextRequest } from "next/server";
import { equipeService } from "@/services/equipe.service";
import { equipeModel } from "@/models/equipe.model"; // AJOUTEZ CET IMPORT

export const equipeController = {
  async list(req: NextRequest) { // MODIFIEZ pour accepter la requête
    try {
      const { searchParams } = new URL(req.url);
      const brigadeId = searchParams.get('brigade');
      
      let data;
      if (brigadeId) {
        // Utilisez le modèle directement pour le filtrage par brigade
        data = await equipeModel.findByBrigade(parseInt(brigadeId));
      } else {
        data = await equipeService.list();
      }
      
      return Response.json(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des équipes" },
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
      
      const equipe = await equipeService.findById(parseInt(id));
      
      if (!equipe) {
        return Response.json(
          { error: "Équipe non trouvée" },
          { status: 404 }
        );
      }
      
      return Response.json(equipe);
    } catch (error) {
      console.error("Erreur récupération équipe:", error);
      return Response.json(
        { error: "Erreur lors de la récupération de l'équipe" },
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