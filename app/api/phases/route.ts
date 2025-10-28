import { NextRequest } from "next/server";
import { phaseController } from "@/controllers/phase.controller";

export async function GET(request: NextRequest) {
  return phaseController.list(request);
}

export async function POST(request: NextRequest) {
  return phaseController.create(request);
}
