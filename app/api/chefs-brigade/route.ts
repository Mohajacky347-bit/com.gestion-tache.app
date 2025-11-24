import { NextRequest } from "next/server";
import { chefBrigadeController } from "@/controllers/chefBrigade.controller";

export async function GET(request: NextRequest) {
  return chefBrigadeController.list(request);
}


