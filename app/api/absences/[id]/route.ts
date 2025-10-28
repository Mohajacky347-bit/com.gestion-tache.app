import { NextRequest } from "next/server";
import { absenceController } from "@/controllers/absence.controller";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  return absenceController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return absenceController.delete(request, { params });
}