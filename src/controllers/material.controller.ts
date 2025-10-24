import { NextRequest } from "next/server";
import { materialService } from "@/services/material.service";

export const materialController = {
  async list(_req: NextRequest) {
    const data = await materialService.list();
    return Response.json(data);
  },
};



