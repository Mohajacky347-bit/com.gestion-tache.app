import { NextRequest } from "next/server";
import { employeController } from "@/controllers/employe.controller";

export async function GET(request: NextRequest) {
  return employeController.list(request);
}

export async function POST(request: NextRequest) {
  return employeController.create(request);
}