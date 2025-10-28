import { NextRequest } from "next/server";
import { employeController } from "@/controllers/employe.controller";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  return employeController.get(request, { params });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return employeController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return employeController.delete(request, { params });
}