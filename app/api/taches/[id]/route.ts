import { NextRequest } from "next/server";
import { taskService } from "@/services/task.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await taskService.get(params.id);
    
    if (!task) {
      return Response.json({ error: "Tâche introuvable" }, { status: 404 });
    }
    
    return Response.json(task);
  } catch (error) {
    console.error("Erreur récupération tâche:", error);
    return Response.json(
      { error: "Erreur lors de la récupération de la tâche" },
      { status: 500 }
    );
  }
}

