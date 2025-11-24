import { NextRequest } from "next/server";
import { brigadeController } from "@/controllers/brigade.controller";

export async function GET(request: NextRequest) {
  return brigadeController.list(request);
}

export async function POST(request: NextRequest) {
  return brigadeController.create(request);
}


