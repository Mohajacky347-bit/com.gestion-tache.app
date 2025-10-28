import { NextRequest } from "next/server";
import { materialController } from "@/controllers/material.controller";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: Params) {
  return materialController.update(request, { params });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  return materialController.delete(request, { params });
}