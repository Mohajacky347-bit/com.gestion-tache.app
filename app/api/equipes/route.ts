import { NextRequest } from "next/server";
import { equipeController } from "@/controllers/equipe.controller";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Si un ID est fourni, récupérez une équipe spécifique
  if (id) {
    return equipeController.getById(request);
  }
  
  // Sinon, listez les équipes (avec filtre brigade optionnel)
  return equipeController.list(request);
}

export async function POST(request: NextRequest) {
  return equipeController.create(request);
}