import { NextRequest } from "next/server";
import { brigadeController } from "@/controllers/brigade.controller";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: Params) {
  return brigadeController.equipes(request, context);
}



