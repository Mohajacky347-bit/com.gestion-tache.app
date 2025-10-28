import { NextRequest } from "next/server";
import { taskService } from "@/services/task.service";

export const taskController = {
  async list(_req: NextRequest) {
    try {
      const data = await taskService.list();
      return Response.json(data);
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
      
      const success = await taskService.update(id, taskData);
      return Response.json({ success });
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
