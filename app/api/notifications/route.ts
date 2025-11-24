import { NextRequest } from "next/server";
import { notificationController } from "@/controllers/notification.controller";

export async function GET(request: NextRequest) {
  return notificationController.list(request);
}

export async function PATCH(request: NextRequest) {
  return notificationController.markAsRead(request);
}







