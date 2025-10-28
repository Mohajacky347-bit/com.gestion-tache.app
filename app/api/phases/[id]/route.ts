import { NextRequest } from "next/server";
import { phaseController } from "@/controllers/phase.controller";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  return phaseController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return phaseController.delete(request, { params });
}
