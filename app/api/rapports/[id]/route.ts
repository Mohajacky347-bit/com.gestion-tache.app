import { NextRequest } from "next/server";
import { rapportController } from "@/controllers/rapport.controller";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  return rapportController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return rapportController.delete(request, { params });
}
