import { NextRequest } from "next/server";
import { dbPool } from "@/lib/db";
import { notificationService } from "@/services/notification.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idTache, materiels } = body;

    if (!idTache || !materiels || !Array.isArray(materiels) || materiels.length === 0) {
      return Response.json(
        { error: "idTache et materiels (tableau) sont requis" },
        { status: 400 }
      );
    }

    // Générer un ID pour la demande
    let newId = "DM001";
    try {
      // Essayer de créer/utiliser la table demande_materiel si elle existe
      const [lastDemande] = await dbPool.query(
        "SELECT id FROM demande_materiel ORDER BY id DESC LIMIT 1"
      );
      const lastRows = lastDemande as { id: string }[];
      if (lastRows && lastRows.length > 0) {
        const lastId = lastRows[0].id || "DM000";
        const lastNumber = parseInt(lastId.replace("DM", ""), 10) || 0;
        newId = `DM${String(lastNumber + 1).padStart(3, "0")}`;
      }
    } catch (error) {
      // Table n'existe pas encore, on génère un ID simple
      console.log("Table demande_materiel n'existe pas encore, utilisation d'un ID simple");
    }

    // Essayer de créer la demande dans la table si elle existe
    try {
      await dbPool.query(
        `INSERT INTO demande_materiel (id, idTache, statut, created_at) 
         VALUES (?, ?, 'en_attente', NOW())`,
        [newId, idTache]
      );

      // Ajouter les matériels demandés
      for (const materiel of materiels) {
        if (!materiel.nom || !materiel.quantite) continue;

        // Trouver l'ID du matériel par son nom
        const [materielRows] = await dbPool.query(
          "SELECT id FROM materiel WHERE nom = ? LIMIT 1",
          [materiel.nom]
        );
        const materielsFound = materielRows as { id: string }[];

        if (materielsFound.length > 0) {
          await dbPool.query(
            `INSERT INTO demande_materiel_detail (idDemande, idMateriel, quantiteDemandee) 
             VALUES (?, ?, ?)`,
            [newId, materielsFound[0].id, materiel.quantite]
          );
        }
      }
    } catch (error) {
      // Table n'existe pas, on continue quand même pour créer la notification
      console.log("Impossible d'insérer dans demande_materiel, continuation avec notification uniquement");
    }

    // Récupérer les informations de la tâche pour la notification
    let taskDescription = idTache;
    try {
      const [taskRows] = await dbPool.query(
        "SELECT description FROM tache WHERE id = ? LIMIT 1",
        [idTache]
      );
      const tasks = taskRows as { description: string }[];
      if (tasks && tasks.length > 0) {
        taskDescription = tasks[0].description || idTache;
      }
    } catch (error) {
      console.log("Impossible de récupérer la description de la tâche");
    }

    // Créer le message détaillé avec la liste des matériels
    const materielsList = materiels.map(m => `- ${m.nom} (quantité: ${m.quantite})`).join("\n");
    const message = `Le chef de brigade demande des matériels pour la tâche "${taskDescription}" (${idTache}).\n\nMatériels demandés:\n${materielsList}`;

    // Créer une notification pour le chef de section
    try {
      await notificationService.createForRole({
        title: "Demande de matériel",
        message: message,
        targetRole: "chef_section",
        payload: {
          demandeId: newId,
          taskId: idTache,
          materiels: materiels,
          redirectTo: "/materiels",
          filter: "demandes",
        },
      });
    } catch (error) {
      console.error("Impossible de notifier le chef de section:", error);
      return Response.json(
        { error: "Erreur lors de la création de la notification" },
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, id: newId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur création demande matériel:", error);
    return Response.json(
      { error: "Erreur lors de la création de la demande de matériel" },
      { status: 500 }
    );
  }
}

