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
      const employe = await employeService.create(body);
      return Response.json(employe, { status: 201 });
    } catch (error) {
      return Response.json({ error: "Erreur lors de la création de l'employé" }, { status: 500 });
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


// import { NextRequest } from "next/server";
// import { employeService } from "@/services/employe.service";

// export const employeController = {
//   async list(_req: NextRequest) {
//     try {
//       const data = await employeService.list();
//       return Response.json(data);
//     } catch (error) {
//       return Response.json({ error: "Erreur lors de la récupération des employés" }, { status: 500 });
//     }
//   },

//   async get(request: NextRequest, { params }: { params: { id: string } }) {
//     try {
//       const employe = await employeService.get(params.id);
//       if (!employe) {
//         return Response.json({ error: "Employé non trouvé" }, { status: 404 });
//       }
//       return Response.json(employe);
//     } catch (error) {
//       return Response.json({ error: "Erreur lors de la récupération de l'employé" }, { status: 500 });
//     }
//   },
// };
