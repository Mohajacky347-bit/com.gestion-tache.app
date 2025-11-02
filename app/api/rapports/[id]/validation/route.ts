import { NextRequest } from "next/server";
import { rapportService } from "@/services/rapport.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ATTENDRE les params d'abord
    const { id } = await params;
    
    const body = await request.json();
    const { validation, commentaire } = body;

    if (!validation || !["En attente", "À réviser", "Approuvé"].includes(validation)) {
      return Response.json({ error: "Statut de validation invalide" }, { status: 400 });
    }

    const success = await rapportService.updateValidation(id, validation, commentaire);
    
    if (!success) {
      return Response.json({ error: "Rapport non trouvé" }, { status: 404 });
    }

    return Response.json({ 
      message: "Statut de validation mis à jour avec succès",
      validation,
      commentaire 
    });
  } catch (error) {
    console.error('Error updating validation:', error);
    return Response.json({ 
      error: "Erreur lors de la mise à jour de la validation" 
    }, { status: 500 });
  }
}