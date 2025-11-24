import { NextRequest } from "next/server";
import { employeService } from "@/services/employe.service";

export const employeController = {
  async list(_req: NextRequest) {
    try {
      const data = await employeService.list();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Erreur lors de la récupération des employés" }, { status: 500 });
    }
  },

  async get(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const employe = await employeService.get(params.id);
      if (!employe) {
        return Response.json({ error: "Employé non trouvé" }, { status: 404 });
      }
      return Response.json(employe);
    } catch (error) {
      return Response.json({ error: "Erreur lors de la récupération de l'employé" }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      console.log("Body reçu:", JSON.stringify(body, null, 2));
      const { isChefBrigade, id_brigade, isChefMagasinier, id_equipe, ...employeData } = body;
      
      // Valider les champs requis
      if (!employeData.nom || !employeData.nom.trim()) {
        return Response.json(
          { error: "Le nom est requis" },
          { status: 400 }
        );
      }
      if (!employeData.prenom || !employeData.prenom.trim()) {
        return Response.json(
          { error: "Le prénom est requis" },
          { status: 400 }
        );
      }
      if (!employeData.fonction || !employeData.fonction.trim()) {
        return Response.json(
          { error: "La fonction est requise" },
          { status: 400 }
        );
      }
      if (!employeData.contact || !employeData.contact.trim()) {
        return Response.json(
          { error: "Le contact est requis" },
          { status: 400 }
        );
      }
      
      // Valider que si isChefBrigade est true, id_brigade est fourni et valide
      if (isChefBrigade) {
        const brigadeIdNum = Number(id_brigade);
        if (!id_brigade || id_brigade === "" || id_brigade === null || id_brigade === undefined || 
            isNaN(brigadeIdNum) || brigadeIdNum === 0) {
          console.error("Validation échouée - isChefBrigade:", isChefBrigade, "id_brigade:", id_brigade, "type:", typeof id_brigade);
          return Response.json(
            { error: "L'ID de la brigade est requis pour un chef de brigade" },
            { status: 400 }
          );
        }
      }
      
      // Valider que si c'est un employé simple (ni chef brigade ni chef magasinier), id_equipe est fourni
      if (!isChefBrigade && !isChefMagasinier && !id_equipe) {
        return Response.json(
          { error: "L'ID de l'équipe est requis pour un employé" },
          { status: 400 }
        );
      }
      
      // S'assurer que disponibilite a une valeur par défaut
      const employePayload = {
        ...employeData,
        disponibilite: employeData.disponibilite || "disponible",
        isChefBrigade: Boolean(isChefBrigade),
        id_brigade: id_brigade ? Number(id_brigade) : undefined,
        isChefMagasinier: Boolean(isChefMagasinier),
        id_equipe: id_equipe ? Number(id_equipe) : undefined
      };
      
      const employe = await employeService.create(employePayload);
      return Response.json(employe, { status: 201 });
    } catch (error: any) {
      console.error("Error creating employe:", error);
      return Response.json(
        { error: error.message || "Erreur lors de la création de l'employé" },
        { status: 500 }
      );
    }
  },

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const body = await request.json();
      const success = await employeService.update(params.id, body);
      if (!success) {
        return Response.json({ error: "Employé non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Employé modifié avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la modification de l'employé" }, { status: 500 });
    }
  },

  async delete(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const success = await employeService.delete(params.id);
      if (!success) {
        return Response.json({ error: "Employé non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Employé supprimé avec succès" });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la suppression de l'employé" }, { status: 500 });
    }
  },
};
