import { NextRequest } from "next/server";
import { notificationService } from "@/services/notification.service";

const isValidRole = (role: string): role is "chef_section" | "chef_brigade" => {
  return role === "chef_section" || role === "chef_brigade";
};

export const notificationController = {
  async list(req: NextRequest) {
    try {
      const role = req.nextUrl.searchParams.get("role");

      if (!role || !isValidRole(role)) {
        return Response.json(
          { error: "Paramètre role manquant ou invalide" },
          { status: 400 }
        );
      }

      const notifications = await notificationService.listForRole(role);
      return Response.json(notifications);
    } catch (error) {
      console.error("Erreur récupération notifications:", error);
      return Response.json(
        { error: "Erreur lors de la récupération des notifications" },
        { status: 500 }
      );
    }
  },

  async markAsRead(req: NextRequest) {
    try {
      const body = await req.json();
      const { id } = body as { id?: string };

      if (!id) {
        return Response.json(
          { error: "Identifiant de notification manquant" },
          { status: 400 }
        );
      }

      const success = await notificationService.markAsRead(id);

      if (!success) {
        return Response.json(
          { error: "Notification introuvable" },
          { status: 404 }
        );
      }

      return Response.json({ success: true });
    } catch (error) {
      console.error("Erreur lecture notification:", error);
      return Response.json(
        { error: "Erreur lors de la mise à jour de la notification" },
        { status: 500 }
      );
    }
  },
};



