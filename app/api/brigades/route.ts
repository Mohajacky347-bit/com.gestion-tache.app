import { NextRequest } from "next/server";
import { brigadeController } from "@/controllers/brigade.controller";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Si un ID est fourni, récupérez une brigade spécifique
  if (id) {
    return brigadeController.getById(request);
  }
  
  // Sinon, listez toutes les brigades
  return brigadeController.list(request);
}

export async function POST(request: NextRequest) {
  return brigadeController.create(request);
}