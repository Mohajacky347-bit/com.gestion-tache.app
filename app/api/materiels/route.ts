import { NextRequest } from "next/server";
import { materialController } from "@/controllers/material.controller";

export async function GET(request: NextRequest) {
  return materialController.list(request);
}

export async function POST(request: NextRequest) {
  return materialController.create(request);
}
