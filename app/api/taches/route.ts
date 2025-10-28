import { NextRequest } from "next/server";
import { taskController } from "@/controllers/task.controller";

export async function GET(request: NextRequest) {
  return taskController.list(request);
}

export async function POST(request: NextRequest) {
  return taskController.create(request);
}

export async function PUT(request: NextRequest) {
  return taskController.update(request);
}

export async function DELETE(request: NextRequest) {
  return taskController.delete(request);
}