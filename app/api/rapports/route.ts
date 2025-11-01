import { NextRequest } from "next/server";
import { rapportController } from "@/controllers/rapport.controller";

export async function GET(request: NextRequest) {
  return rapportController.list(request);
}

export async function POST(request: NextRequest) {
  return rapportController.create(request);
}