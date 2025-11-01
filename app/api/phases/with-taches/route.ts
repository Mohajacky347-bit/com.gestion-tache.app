import { NextRequest } from "next/server";
import { phaseService } from "@/services/phase.service";

export async function GET(request: NextRequest) {
  try {
    const data = await phaseService.listWithTaches();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Erreur lors de la récupération des phases" }, { status: 500 });
  }
}