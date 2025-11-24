import { NextRequest } from "next/server";
import { equipeController } from "@/controllers/equipe.controller";

export async function GET(request: NextRequest) {
  return equipeController.list(request);
}

export async function POST(request: NextRequest) {
  return equipeController.create(request);
}


