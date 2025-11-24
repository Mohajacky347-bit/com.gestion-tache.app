import { NextRequest } from "next/server";
import { chefBrigadeService } from "@/services/chefBrigade.service";

export const chefBrigadeController = {
  async list(_req: NextRequest) {
    try {
      const data = await chefBrigadeService.list();
      return Response.json(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des chefs de brigade:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des chefs de brigade" },
        { status: 500 }
      );
    }
  },
};


