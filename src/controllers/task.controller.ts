import { NextRequest } from "next/server";
import { taskService } from "@/services/task.service";
import { freshResponse } from "@/lib/api-helpers";

export const taskController = {
  async list(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const brigadeId = searchParams.get("brigadeId");
      const equipeId = searchParams.get("equipeId");

      const filters: { brigadeId?: number; equipeId?: number } = {};
      if (brigadeId) {
        filters.brigadeId = Number(brigadeId);
      }
      if (equipeId) {
        filters.equipeId = Number(equipeId);
      }

      const data = await taskService.list(
        filters.brigadeId || filters.equipeId ? filters : undefined
      );
      // Cache de 30 secondes pour les tâches (données qui changent fréquemment)
      return freshResponse(data, 30);
    } catch (error) {
      console.error("Erreur liste tâches:", error);
      return Response.json({ error: "Erreur lors de la récupération des tâches" }, { status: 500 });
    }
  },

  async create(req: NextRequest) {
    try {
      const body = await req.json();
      const task = await taskService.create(body);
      return Response.json(task, { status: 201 });
    } catch (error) {
      console.error("Erreur création tâche:", error);
      return Response.json({ error: "Erreur lors de la création de la tâche" }, { status: 500 });
    }
  },

  async update(req: NextRequest) {
    try {
      const body = await req.json();
      const { id, ...taskData } = body;
      
      if (!id) {
        return Response.json({ error: "ID manquant" }, { status: 400 });
      }
      
      const updated = await taskService.update(id, taskData);

      if (!updated) {
        return Response.json({ error: "Tâche introuvable" }, { status: 404 });
      }

      return Response.json(updated);
    } catch (error) {
      console.error("Erreur modification tâche:", error);
      return Response.json({ error: "Erreur lors de la modification de la tâche" }, { status: 500 });
    }
  },

  async delete(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      
      if (!id) {
        return Response.json({ error: "ID manquant" }, { status: 400 });
      }
      
      const success = await taskService.delete(id);
      return Response.json({ success });
    } catch (error) {
      console.error("Erreur suppression tâche:", error);
      return Response.json({ error: "Erreur lors de la suppression de la tâche" }, { status: 500 });
    }
  }
};
