import { NextRequest } from "next/server";
import { absenceController } from "@/controllers/absence.controller";

export async function GET(request: NextRequest) {
  return absenceController.list(request);
}

export async function POST(request: NextRequest) {
  return absenceController.create(request);
}